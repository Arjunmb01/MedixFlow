import app from "@/app";
import { IAppointmentRepository } from "../../../domain/repositories/IAppointmentRepository";
import { DateTimeService } from "@/domain/services/DateTimeService";

export class GetUpcomingAppointmentsUseCase {
    constructor(private readonly appointmentRepo: IAppointmentRepository) {}

    async execute (patientId: string) {
        const appointments = await this.appointmentRepo.getAppointmentsByPatientId(patientId);

        return appointments.filter(app => {
            const apptTime = DateTimeService.toDateTime(
                app.appointmentDate,
                app.slotStart
            );

            return (
                apptTime >= new Date() &&
                app.status !== "CANCELLED" &&
                app.status !== "COMPLETED"
            )
        })
    }
}
