import { IAppointmentRepository } from "../../../domain/repositories/IAppointmentRepository";

export class GetUpcomingAppointmentsUseCase {
    constructor(private readonly appointmentRepo: IAppointmentRepository) {}

    async execute(patientId: string) {
        const appointments = await this.appointmentRepo.getAppointmentsByPatientId(patientId);
        const now = new Date();
        return appointments.filter(app => new Date(app.appointmentDate) >= now && app.status !== "CANCELLED" && app.status !== "COMPLETED");
    }
}
