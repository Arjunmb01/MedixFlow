import { IAppointmentRepository } from "../../../domain/repositories/IAppointmentRepository";

export class GetDoctorAppointmentsUseCase {
    constructor(private readonly appointmentRepo: IAppointmentRepository) {}

    async execute(doctorId: string) {
        return this.appointmentRepo.getAppointmentsByDoctorId(doctorId);
    }
}
