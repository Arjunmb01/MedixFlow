import { IPatientRepository } from "../interfaces/IPatientRepository";
import { MESSAGES } from "../../../core/constants";

export class GetPatientByIdUseCase {
  constructor(private patientRepository: IPatientRepository) {}

  async execute(id: string) {
    const patient = await this.patientRepository.findById(id);
    if (!patient) {
      throw new Error(MESSAGES.PATIENT_NOT_FOUND);
    }
    return patient;
  }
}
