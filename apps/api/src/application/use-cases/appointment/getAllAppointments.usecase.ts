import { IAppointmentRepository } from "@/domain/repositories/IAppointmentRepository";
import { DoctorAppointmentFilter } from "@/domain/value-objects/types/appointment.types";

export class GetAllAppointmentsUseCase {
    constructor(private appointmentRepo: IAppointmentRepository) {}

    async execute(filter?: DoctorAppointmentFilter) {
        return this.appointmentRepo.getAllAppointments(filter);
    }
}
