import { PatientRepository } from "../repostries/patient.repository"
import { UpdatePasswordInput } from "../types/patient.types"
import bcrypt from "bcryptjs"

export class UpdatePasswordUseCase {
  constructor(private patientRepository: PatientRepository) {}

  async execute(patientId: string, data: UpdatePasswordInput) {
    const patient = await this.patientRepository.findById(patientId)

    if (!patient || !patient.user) {
      throw new Error("Patient not found")
    }

    const isMatch = await bcrypt.compare(data.currentPassword, patient.user.passwordHash)
    if (!isMatch) {
      throw new Error("Invalid current password")
    }

    const newPasswordHash = await bcrypt.hash(data.newPassword, 10)
    await this.patientRepository.updatePassword(patientId, newPasswordHash)

    return { message: "Password updated successfully" }
  }
}
