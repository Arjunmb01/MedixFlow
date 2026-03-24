import { IAppointmentRepository } from "../../../domain/repositories/IAppointmentRepository";

export class GetPatientAppointmentsUseCase {
    constructor(private readonly appointmentRepo: IAppointmentRepository) {}

    async execute(patientId: string) {
        return this.appointmentRepo.getAppointmentsByPatientId(patientId);
    }
}
