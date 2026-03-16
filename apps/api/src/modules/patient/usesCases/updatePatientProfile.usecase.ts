import { PatientRepository } from "../repostries/patient.repository"
import { UpdatePatientInput } from "../types/patient.types"

export class UpdatePatientProfileUseCase {

  constructor(private patientRepository: PatientRepository) {}

  async execute(patientId: string, data: UpdatePatientInput) {

    const patient = await this.patientRepository.findById(patientId)

    if (!patient) {
      throw new Error("Patient not found")
    }

    const updatedPatient = await this.patientRepository.updatePatient(
      patientId,
      data
    )

    return updatedPatient
  }
}