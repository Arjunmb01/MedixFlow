import { IAppointmentRepository } from "@/domain/repositories/IAppointmentRepository";
import { IConsultationRepository } from "@/domain/repositories/IConsultationRepository";
import { SendNotificationUseCase } from "../notification/SendNotificationUseCase";
import { NotificationType } from "@/domain/value-objects/types/notification.types";

export class CancelAppointmentUseCase {
    constructor(
        private readonly appointmentRepo : IAppointmentRepository,
        private readonly consultationRepo : IConsultationRepository,
        private readonly sendNotificationUseCase: SendNotificationUseCase
    ) {}

    async execute (appointmentId : string, patientId : string, reason : string) {
        const appointment = await this.appointmentRepo.findById(appointmentId);

        if(!appointment) throw new Error("Appointment not found");
        
        if(appointment.patientId !== patientId) throw new Error("Unauthorized to cancel to this appointment")
        
        if(appointment.status === "CANCELLED" || appointment.status === "COMPLETED") throw new Error(`Cannot cancel appointment with status ${appointment.status}`);

        const updatedAppointment = await this.appointmentRepo.cancelAppointment(
            appointmentId,
            reason
        )

        await this.consultationRepo.deleteByAppointmentId(appointmentId);

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