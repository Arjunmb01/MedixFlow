import { IAppointmentRepository } from "../../../domain/repositories/IAppointmentRepository";
import { INotificationRepository } from "../../../domain/repositories/INotificationRepository";

export class CancelAppointmentUseCase {
    constructor(
        private readonly appointmentRepo: IAppointmentRepository,
        private readonly notificationRepo: INotificationRepository
    ) {}

    async execute(appointmentId: string, patientId: string, reason: string) {
        const appointment = await this.appointmentRepo.findById(appointmentId);
        
        if (!appointment) {
            throw new Error("Appointment not found");
        }

        if (appointment.patientId !== patientId) {
            throw new Error("Unauthorized to cancel this appointment");
        }

        if (appointment.status === "COMPLETED" || appointment.status === "CANCELLED") {
            throw new Error(`Cannot cancel appointment with status ${appointment.status}`);
        }

        const updatedAppointment = await this.appointmentRepo.cancelAppointment(appointmentId, reason);
        
        // Notify doctor
        await this.notificationRepo.create({
            userId: appointment.doctorId,
            title: "Appointment Cancelled",
            message: `Patient has cancelled the appointment scheduled on ${appointment.appointmentDate.toDateString()} at ${appointment.slotStart}. Reason: ${reason}`,
            type: "APPOINTMENT"
        });

        return updatedAppointment;
    }
}
