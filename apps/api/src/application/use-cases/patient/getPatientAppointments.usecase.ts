import { IAppointmentRepository } from "../../../domain/repositories/IAppointmentRepository";

export class GetPatientAppointmentsUseCase {
    constructor(private readonly appointmentRepo: IAppointmentRepository) {}

    async execute(patientId: string) {
        await this.appointmentRepo.markPastAppointmentsAsNotAttended();
        return this.appointmentRepo.getAppointmentsByPatientId(patientId);
    }
}
