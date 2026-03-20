import { IPatientRepository } from "@/domain/repositories/IPatientRepository";

export class GetAllPatientsUseCase {
  constructor(private patientRepository: IPatientRepository) {}

  async execute(query: any) {
    return this.patientRepository.getPatients(query);
  }
}
