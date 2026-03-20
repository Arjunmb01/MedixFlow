import { MESSAGES } from "@/shared/constants";
import { IPatientRepository } from "@/domain/repositories/IPatientRepository";

export class UpdateEmergencyContactUseCase {
  constructor(private patientRepository: IPatientRepository) {}

  async execute(patientId: string, contacts: any[]) {
    const patient = await this.patientRepository.findById(patientId);

    if (!patient) {
      throw new Error(MESSAGES.PATIENT_NOT_FOUND);
    }

    await this.patientRepository.replaceEmergencyContacts(patientId, contacts);

    return { message: MESSAGES.EMERGENCY_CONTACT_UPDATED };
  }
}
