import { IAppointmentRepository } from "../../../domain/repositories/IAppointmentRepository";
import { IDateTimeService } from "@/domain/services/IDateTimeService";

export class GetUpcomingAppointmentsUseCase {
    constructor(
        private readonly appointmentRepo: IAppointmentRepository,
        private readonly dateTimeService: IDateTimeService
    ) {}

    async execute (patientId: string) {
        await this.appointmentRepo.markPastAppointmentsAsNotAttended();
        const appointments = await this.appointmentRepo.getAppointmentsByPatientId(patientId);
        const now = this.dateTimeService.now();

        return appointments.filter(app => 
            this.dateTimeService.isUpcoming(app.appointmentDate, app.slotStart) &&
            app.status !== "CANCELLED" &&
            app.status !== "COMPLETED"
        );
    }
}
