import { IPatientRepository } from "@/domain/repositories/IPatientRepository";
import { Patient } from "@/domain/entities/Patient";
import { MESSAGES } from "@/shared/constants";

export class GetPatientByIdUseCase {
  constructor(private patientRepository: IPatientRepository) {}

  async execute(id: string): Promise<Patient> {
    const patient = await this.patientRepository.findById(id);
    if (!patient) {
      throw new Error(MESSAGES.PATIENT_NOT_FOUND);
    }
    return patient;
  }
}
