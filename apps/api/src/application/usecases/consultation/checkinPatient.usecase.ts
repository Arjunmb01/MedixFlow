import { IAppointmentRepository } from "../../../domain/repositories/IAppointmentRepository";
import { IConsultationRepository } from "../../../domain/repositories/IConsultationRepository";
import { INotificationRepository } from "../../../domain/repositories/INotificationRepository";

export class CheckinPatientUseCase {
    constructor(
        private readonly appointmentRepo: IAppointmentRepository,
        private readonly consultationRepo: IConsultationRepository,
        private readonly notificationRepo: INotificationRepository
    ) {}

    async execute(appointmentId: string, patientId: string) {
        const appointment = await this.appointmentRepo.findById(appointmentId);

        if (!appointment) {
            throw new Error("Appointment not found");
        }

        if (appointment.patientId !== patientId) {
            throw new Error("Unauthorized to check-in for this appointment");
        }

        if (appointment.status === "COMPLETED" || appointment.status === "CANCELLED") {
            throw new Error(`Cannot check-in. Appointment is ${appointment.status}`);
        }

        // Check if consultation already exists
        const existing = await this.consultationRepo.findByAppointmentId(appointmentId);
        if (existing) {
            throw new Error("Patient is already checked in for this appointment.");
        }

        const consultation = await this.consultationRepo.create({
            appointmentId: appointment.id,
            doctorId: appointment.doctorId,
            patientId: appointment.patientId
        });

        await this.notificationRepo.create({
            userId: appointment.doctorId,
            type: "CONSULTATION",
            title: "Patient Checked In",
            message: `Patient ${appointment.patient.firstName} ${appointment.patient.lastName} has checked in and is waiting in the queue.`
        });

        return consultation;
    }
}
