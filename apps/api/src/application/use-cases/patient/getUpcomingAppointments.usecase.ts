import { IAppointmentRepository } from "../../../domain/repositories/IAppointmentRepository";
import { IDateTimeService } from "@/domain/services/IDateTimeService";

export class GetUpcomingAppointmentsUseCase {
    constructor(
        private readonly appointmentRepo: IAppointmentRepository,
        private readonly dateTimeService: IDateTimeService
    ) {}

    async execute (patientId: string) {
        await this.appointmentRepo.markPastAppointmentsAsNotAttended(patientId);
        const appointmentsResponse = await this.appointmentRepo.getAppointmentsByPatientId(patientId);
        const patientAppointments = appointmentsResponse.data;
        const now = this.dateTimeService.now();

        return patientAppointments.filter((app: any) => 
            this.dateTimeService.isUpcoming(app.appointmentDate, app.slotStart) &&
            app.status !== "CANCELLED" &&
            app.status !== "COMPLETED"
        );
    }
}
