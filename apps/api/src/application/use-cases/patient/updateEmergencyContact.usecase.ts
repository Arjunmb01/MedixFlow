import { MESSAGES } from "@/shared/constants";
import { IPatientRepository } from "@/domain/repositories/IPatientRepository";
import { EmergencyContact } from "@/domain/value-objects/types/patient.repository.types";

export class UpdateEmergencyContactUseCase {
  constructor(private patientRepository: IPatientRepository) {}

  async execute(patientId: string, contacts: EmergencyContact[]): Promise<{ message: string }> {
    const patient = await this.patientRepository.findById(patientId);

    if (!patient) {
      throw new Error(MESSAGES.PATIENT_NOT_FOUND);
    }

    await this.patientRepository.replaceEmergencyContacts(patientId, contacts);

    return { message: MESSAGES.EMERGENCY_CONTACT_UPDATED };
  }
}
