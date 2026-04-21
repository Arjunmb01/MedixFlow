import { IAppointmentRepository } from "@/domain/repositories/IAppointmentRepository";
import { IConsultationRepository } from "@/domain/repositories/IConsultationRepository";
import { SendNotificationUseCase } from "../notification/SendNotificationUseCase";
import { NotificationType } from "@/domain/value-objects/types/notification.types";
import { IPaymentRepository } from "@/domain/repositories/IPaymentRepository";
import { IRazorpayService } from "@/domain/services/IRazorpayService";
import { IWalletRepository } from "@/domain/repositories/IWalletRepository";
import { PaymentStatus } from "@/domain/value-objects/enums/PaymentStatus";
import { PaymentMethod } from "@/domain/value-objects/enums/PaymentMethod";
import { TransactionType } from "@/domain/value-objects/enums/TransactionType";

export class CancelAppointmentUseCase {
    constructor(
        private readonly appointmentRepo : IAppointmentRepository,
        private readonly consultationRepo : IConsultationRepository,
        private readonly sendNotificationUseCase: SendNotificationUseCase,
        private readonly paymentRepo: IPaymentRepository,
        private readonly razorpayService: IRazorpayService,
        private readonly walletRepo: IWalletRepository
    ) {}

    async execute (appointmentId : string, patientId : string, reason : string, refundToWallet: boolean = false, isSystemAction: boolean = false) {
        const appointment = await this.appointmentRepo.findById(appointmentId);

        if(!appointment) throw new Error("Appointment not found");
        
        if(!isSystemAction && appointment.patientId !== patientId) {
            throw new Error("Unauthorized to cancel to this appointment");
        }
        
        if(appointment.status === "CANCELLED" || appointment.status === "COMPLETED") throw new Error(`Cannot cancel appointment with status ${appointment.status}`);

        const updatedAppointment = await this.appointmentRepo.cancelAppointment(
            appointmentId,
            reason
        )

        await this.consultationRepo.deleteByAppointmentId(appointmentId);

        // Refund Logic
        try {
            const payment = await this.paymentRepo.findByAppointmentId(appointmentId);
            
            if (payment && payment.status === PaymentStatus.PAID) {
                const wallet = await this.walletRepo.findByPatientId(patientId);
                
                if (refundToWallet) {
                    // Force refund to wallet regardless of original method
                    if (wallet) {
                        await this.walletRepo.updateBalance(
                            wallet.id, 
                            payment.amount, 
                            TransactionType.REFUND, 
                            `Refund for cancelled appointment ${appointmentId}`
                        );
                        await this.paymentRepo.updateStatus(payment.id, PaymentStatus.REFUNDED);
                        await this.appointmentRepo.updatePaymentStatus(appointmentId, PaymentStatus.REFUNDED);
                    } else {
                        throw new Error("Patient wallet not found for refund");
                    }
                } else {
                    // Standard logic: refund to original source
                    if (payment.paymentMethod === PaymentMethod.RAZORPAY) {
                        if (payment.razorpayPaymentId) {
                            await this.razorpayService.refundPayment(payment.razorpayPaymentId, payment.amount);
                            await this.paymentRepo.updateStatus(payment.id, PaymentStatus.REFUNDED);
                            await this.appointmentRepo.updatePaymentStatus(appointmentId, PaymentStatus.REFUNDED);
                        } else {
                            console.error(`Refund failed: Missing razorpayPaymentId for payment ${payment.id}`);
                        }
                    } else if (payment.paymentMethod === PaymentMethod.WALLET) {
                        if (wallet) {
                            await this.walletRepo.updateBalance(
                                wallet.id, 
                                payment.amount, 
                                TransactionType.REFUND, 
                                `Refund for cancelled appointment ${appointmentId}`
                            );
                            await this.paymentRepo.updateStatus(payment.id, PaymentStatus.REFUNDED);
                            await this.appointmentRepo.updatePaymentStatus(appointmentId, PaymentStatus.REFUNDED);
                        }
                    }
                }
            }
        } catch (error) {
            // We log the error but allow the cancellation to proceed as per the plan
            console.error(`Error during refund for appointment ${appointmentId}:`, error);
        }

        // Notify Doctor
        await this.sendNotificationUseCase.execute({
            recipientId: appointment.doctorId,
            title: "Appointment Cancelled",
            message: `The appointment scheduled for ${appointment.appointmentDate.toLocaleDateString()} at ${appointment.slotStart} has been cancelled.`,
            type: NotificationType.CANCELLED,
        });

        // Notify Patient
        await this.sendNotificationUseCase.execute({
            recipientId: appointment.patientId,
            title: "Appointment Cancelled",
            message: `Your appointment scheduled for ${appointment.appointmentDate.toLocaleDateString()} at ${appointment.slotStart} has been cancelled.`,
            type: NotificationType.CANCELLED,
        });

        return updatedAppointment;
    }
}