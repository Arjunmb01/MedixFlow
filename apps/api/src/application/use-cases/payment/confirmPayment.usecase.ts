import { IPaymentRepository } from "../../../domain/repositories/IPaymentRepository";
import { IAppointmentRepository } from "../../../domain/repositories/IAppointmentRepository";
import { PaymentStatus } from "../../../domain/value-objects/enums/PaymentStatus";
import { AppointmentStatus } from "../../../domain/value-objects/enums/AppointmentStatus";
import { IQueueService } from "../../../domain/services/IQueueService";
import { SocketService } from "../../../infrastructure/services/SocketService";
import { SendNotificationUseCase } from "../notification/SendNotificationUseCase";
import { NotificationType } from "../../../domain/value-objects/types/notification.types";

export interface ConfirmPaymentInput {
    paymentId: string;
    gatewayData: {
        razorpayPaymentId?: string;
        razorpaySignature?: string;
        stripePaymentIntentId?: string;
        stripeSessionId?: string;
        paypalOrderId?: string;
        paypalCaptureId?: string;
    };
}

export class ConfirmPaymentUseCase {
    constructor(
        private readonly paymentRepo: IPaymentRepository,
        private readonly appointmentRepo: IAppointmentRepository,
        private readonly queueService: IQueueService,
        private readonly socketService: SocketService,
        private readonly sendNotificationUseCase: SendNotificationUseCase
    ) {}

    async execute(data: ConfirmPaymentInput): Promise<void> {
        const payment = await this.paymentRepo.updateStatus(data.paymentId, PaymentStatus.PAID, data.gatewayData);
        
        const appointment = await this.appointmentRepo.findById(payment.appointmentId);
        if (!appointment) return;

        if (appointment.status === AppointmentStatus.BOOKED) return; // Already confirmed

        // Update Appointment to BOOKED and Payment Status to PAID
        await Promise.all([
            this.appointmentRepo.updateStatus(appointment.id, AppointmentStatus.BOOKED),
            this.appointmentRepo.updatePaymentStatus(appointment.id, PaymentStatus.PAID)
        ]);
        
        // Assign Queue Number
        const queueNumber = await this.queueService.addToQueue(appointment.doctorId, appointment.appointmentDate, appointment.id);
        await this.appointmentRepo.updateQueuePosition(appointment.id, queueNumber);

        // Notify Doctor
        await this.sendNotificationUseCase.execute({
            recipientId: appointment.doctorId,
            title: "New Appointment Confirmed",
            message: `Appointment with ${appointment.patient.firstName} confirmed for ${appointment.appointmentDate.toLocaleDateString()} at ${appointment.slotStart}.`,
            type: NotificationType.BOOKED,
        });

        // Notify Patient
        await this.sendNotificationUseCase.execute({
            recipientId: appointment.patientId,
            title: "Booking Confirmed",
            message: `Your appointment is confirmed for ${appointment.appointmentDate.toLocaleDateString()} at ${appointment.slotStart}.`,
            type: NotificationType.BOOKED,
        });

        // Notify via Sockets
        this.socketService.emitAppointmentBooked(appointment.doctorId, { ...appointment, queueNumber, status: AppointmentStatus.BOOKED });
        const fullQueue = await this.appointmentRepo.getTodaysQueue(appointment.doctorId);
        this.socketService.emitQueueUpdated(appointment.doctorId, appointment.appointmentDate, fullQueue);
    }
}
