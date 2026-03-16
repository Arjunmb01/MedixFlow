import { PatientRepository } from "../repostries/patient.repository"
import { EmergencyContactInput } from "../types/patient.types"

export class UpdateEmergencyContactUseCase {

  constructor(private patientRepository: PatientRepository) {}

  async execute(
    patientId: string,
    contacts: EmergencyContactInput[]
  ) {

    const patient = await this.patientRepository.findById(patientId)

    if (!patient) {
      throw new Error("Patient not found")
    }

    await this.patientRepository.replaceEmergencyContacts(
      patientId,
      contacts
    )

    return {
      message: "Emergency contacts updated successfully"
    }
  }
}