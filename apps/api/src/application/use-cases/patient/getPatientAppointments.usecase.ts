import { IAppointmentRepository } from "../../../domain/repositories/IAppointmentRepository";
import { DoctorAppointmentFilter } from "@/domain/value-objects/types/appointment.types";

export class GetPatientAppointmentsUseCase {
    constructor(private readonly appointmentRepo: IAppointmentRepository) {}

    async execute(patientId: string, filter?: DoctorAppointmentFilter) {
        const result = await this.appointmentRepo.getAppointmentsByPatientId(patientId, {
            ...filter,
            includeConsultationDetails: filter?.includeConsultationDetails ?? true,
        });
        return result;
    }
}
