import { IAppointmentRepository } from "../../../domain/repositories/IAppointmentRepository";
import { DoctorAppointmentFilter } from "@/domain/value-objects/types/appointment.types";

export class GetPatientAppointmentsUseCase {
    constructor(private readonly appointmentRepo: IAppointmentRepository) {}

    async execute(patientId: string, filter?: DoctorAppointmentFilter) {
        await this.appointmentRepo.markPastAppointmentsAsNotAttended(patientId);
        const result = await this.appointmentRepo.getAppointmentsByPatientId(patientId, filter);
        return result;
    }
}
