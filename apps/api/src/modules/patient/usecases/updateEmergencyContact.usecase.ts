import { MESSAGES } from "../../../core/constants";
import { IPatientRepository } from "../interfaces/IPatientRepository"
import { EmergencyContactInput } from "../types/patient.types"

export class UpdateEmergencyContactUseCase {
  constructor(private patientRepository: IPatientRepository) {}

  async execute(patientId: string, contacts: EmergencyContactInput[]) {
    const patient = await this.patientRepository.findById(patientId)

    if (!patient) {
      throw new Error(MESSAGES.PATIENT_NOT_FOUND)
    }

    await this.patientRepository.replaceEmergencyContacts(patientId, contacts)

    return { message: MESSAGES.EMERGENCY_CONTACT_UPDATED }
  }
}