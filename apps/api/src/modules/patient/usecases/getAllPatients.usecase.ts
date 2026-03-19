import { IPatientRepository } from "../interfaces/IPatientRepository";

export class GetAllPatientsUseCase {
  constructor(private patientRepository: IPatientRepository) {}

  async execute(query: any) {
    return this.patientRepository.getPatients(query);
  }
}
