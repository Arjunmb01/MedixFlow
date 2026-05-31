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
import { IQueueService } from "@/domain/services/IQueueService";
import { SocketService } from "@/infrastructure/services/SocketService";
import { AppointmentStatus } from "@/domain/value-objects/enums/AppointmentStatus";

import { RefundAppointmentUseCase } from "./RefundAppointmentUseCase";

export class CancelAppointmentUseCase {
    constructor(
        private readonly appointmentRepo : IAppointmentRepository,
        private readonly consultationRepo : IConsultationRepository,
        private readonly sendNotificationUseCase: SendNotificationUseCase,
        private readonly paymentRepo: IPaymentRepository,
        private readonly razorpayService: IRazorpayService,
        private readonly walletRepo: IWalletRepository,
        private readonly queueService: IQueueService,
        private readonly socketService: SocketService,
        private readonly refundAppointmentUseCase: RefundAppointmentUseCase
    ) {}

    async execute (appointmentId : string, patientId : string, reason : string, refundToWallet: boolean = false, isSystemAction: boolean = false) {
        const appointment = await this.appointmentRepo.findById(appointmentId);
        console.log("Appointment :  ",appointment)
        if(!appointment) throw new Error("Appointment not found");
        
        if(!isSystemAction && appointment.patientId !== patientId) {
            throw new Error("Unauthorized to cancel to this appointment");
        }
        
        if(appointment.status === "CANCELLED" || appointment.status === "COMPLETED") throw new Error(`Cannot cancel appointment with status ${appointment.status}`);

        const updatedAppointment = await this.appointmentRepo.cancelAppointment(
            appointmentId,
            reason
        )

        await this.appointmentRepo.createAuditLog({
            appointmentId: appointmentId,
            action: "CANCELLED",
            actorId: isSystemAction ? "SYSTEM" : patientId,
            actorRole: isSystemAction ? "ADMIN" : "PATIENT",
            oldStatus: appointment.status,
            newStatus: "CANCELLED",
            details: { reason, refundToWallet, isSystemAction }
        });

        await this.consultationRepo.deleteByAppointmentId(appointmentId);

        try {
            await this.refundAppointmentUseCase.execute(appointmentId, patientId, refundToWallet);
        } catch (error) {
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

        // Queue & Socket logic
        await this.queueService.removeFromQueue(appointment.doctorId, appointment.appointmentDate, appointmentId);
        
        const updatedQueue = await this.appointmentRepo.getTodaysQueue(appointment.doctorId);
        this.socketService.emitQueueUpdated(appointment.doctorId, appointment.appointmentDate, updatedQueue);
        this.socketService.emitStatusChanged(appointment.patientId, appointmentId, AppointmentStatus.CANCELLED);

        return updatedAppointment;
    }
}
