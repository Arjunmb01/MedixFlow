import { IAppointmentRepository } from "../../../domain/repositories/IAppointmentRepository";
import { AppointmentWithDoctorAndPatient } from "../../../domain/repositories/IAppointmentRepository";

export class GetAppointmentByIdUseCase {
    constructor(private readonly appointmentRepo: IAppointmentRepository) {}

    async execute(id: string): Promise<AppointmentWithDoctorAndPatient | null> {
        return this.appointmentRepo.findById(id);
    }
}
