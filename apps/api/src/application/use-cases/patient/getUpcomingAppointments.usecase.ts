import { IAppointmentRepository } from "../../../domain/repositories/IAppointmentRepository";
import { IDateTimeService } from "@/domain/services/IDateTimeService";

export class GetUpcomingAppointmentsUseCase {
    constructor(
        private readonly appointmentRepo: IAppointmentRepository,
        private readonly dateTimeService: IDateTimeService
    ) {}

<<<<<<< HEAD
    async execute(patientId: string) {
        const appointmentsResponse = await this.appointmentRepo.getAppointmentsByPatientId(
            patientId,
            { isUpcoming: true, limit: 20, page: 1, sortBy: "appointmentDate", sortOrder: "asc" }
        );
=======
    async execute (patientId: string) {
        await this.appointmentRepo.markPastAppointmentsAsNotAttended(patientId);
        const appointmentsResponse = await this.appointmentRepo.getAppointmentsByPatientId(patientId);
        const patientAppointments = appointmentsResponse.data;
        const now = this.dateTimeService.now();
>>>>>>> 141ec674faa5e8dec8f62adfdfa63bd47aaf7909

        return appointmentsResponse.data.filter(
            (app) =>
                this.dateTimeService.isUpcoming(app.appointmentDate, app.slotStart) &&
                app.status !== "CANCELLED" &&
                app.status !== "COMPLETED"
        );
    }
}
