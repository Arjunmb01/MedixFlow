import { IAppointmentRepository } from "@/domain/repositories/IAppointmentRepository";

export class GetAllAppointmentsUseCase {
    constructor(private appointmentRepo: IAppointmentRepository) {}

    async execute() {
        return this.appointmentRepo.getAllAppointments();
    }
}
