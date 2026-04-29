import { IAppointmentRepository } from "@/domain/repositories/IAppointmentRepository";
import { SendNotificationUseCase } from "../notification/SendNotificationUseCase";
import { NotificationType } from "@/domain/value-objects/types/notification.types";
import { IDateTimeService } from "@/domain/services/IDateTimeService";

export class ProcessDoctorLeaveUseCase {
    constructor(
        private readonly appointmentRepo: IAppointmentRepository,
        private readonly sendNotificationUseCase: SendNotificationUseCase,
        private readonly dateTimeService: IDateTimeService
    ) {}

    async execute(doctorId: string, startDate: Date, endDate: Date, reason: string) {
        // 1. Find all impacted appointments
        const impactedIds = await this.appointmentRepo.findImpactedAppointments(doctorId, startDate, endDate);

        if (impactedIds.length === 0) return { processed: 0 };

        // 2. For each appointment, notify patient and create a placeholder proposal or just notify
        // In a real system, we might want to bulk-cancel or bulk-request-reschedule
        for (const id of impactedIds) {
            const appointment = await this.appointmentRepo.findById(id);
            if (!appointment) continue;

            // Notify patient
            await this.sendNotificationUseCase.execute({
                recipientId: appointment.patientId,
                title: "Doctor Unavailable",
                message: `We regret to inform you that Dr. ${appointment.doctor.lastName} is unavailable on ${appointment.appointmentDate.toLocaleDateString()} due to ${reason}. Please reschedule your appointment.`,
                type: NotificationType.DOCTOR_UNAVAILABLE,
            });

            // Create an audit log for the system action
            await this.appointmentRepo.createAuditLog({
                appointmentId: id,
                action: "DOCTOR_UNAVAILABLE",
                actorId: doctorId,
                actorRole: "DOCTOR",
                oldStatus: appointment.status,
                newStatus: appointment.status,
                details: { startDate, endDate, reason }
            });
        }

        return { processed: impactedIds.length };
    }
}
