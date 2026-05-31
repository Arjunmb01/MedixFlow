import { IAppointmentRepository } from "../../../domain/repositories/IAppointmentRepository";
import { IDateTimeService } from "@/domain/services/IDateTimeService";

export class GetUpcomingAppointmentsUseCase {
    constructor(
        private readonly appointmentRepo: IAppointmentRepository,
        private readonly dateTimeService: IDateTimeService
    ) {}

    async execute(patientId: string) {
        const appointmentsResponse = await this.appointmentRepo.getAppointmentsByPatientId(
            patientId,
            { isUpcoming: true, limit: 20, page: 1, sortBy: "appointmentDate", sortOrder: "asc" }
        );

        return appointmentsResponse.data.filter(
            (app) =>
                this.dateTimeService.isUpcoming(app.appointmentDate, app.slotStart) &&
                app.status !== "CANCELLED" &&
                app.status !== "COMPLETED"
        );
    }
}
