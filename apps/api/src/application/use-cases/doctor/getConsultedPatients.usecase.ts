import { IDoctorMedicalRepository } from "@/domain/repositories/IDoctorRepository";
import { ConsultedPatientRecord } from "@/domain/value-objects/types/doctor.repository.types";

export class GetConsultedPatientsUseCase {
  constructor(private readonly doctorRepo: IDoctorMedicalRepository) {}

  async execute(doctorId: string): Promise<ConsultedPatientRecord[]> {
    return await this.doctorRepo.getConsultedPatients(doctorId);
  }
}
