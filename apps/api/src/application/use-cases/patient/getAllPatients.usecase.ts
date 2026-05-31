import { IPatientRepository } from "@/domain/repositories/IPatientRepository";
import { PatientFilters, PaginatedPatients } from "@/domain/value-objects/types/patient.repository.types";

export class GetAllPatientsUseCase {
  constructor(private patientRepository: IPatientRepository) {}

  async execute(query: PatientFilters): Promise<PaginatedPatients> {
    return this.patientRepository.getPatients(query);
  }
}
