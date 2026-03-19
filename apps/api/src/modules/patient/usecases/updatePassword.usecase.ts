import { MESSAGES } from "../../../core/constants";
import { IPatientRepository } from "../interfaces/IPatientRepository"
import { UpdatePasswordInput } from "../types/patient.types"
import bcrypt from "bcryptjs"

export class UpdatePasswordUseCase {

  constructor(private patientRepository: IPatientRepository) {}

  async execute(patientId: string, data: UpdatePasswordInput) {
    
    if (data.newPassword.length < 8) {
        throw new Error(MESSAGES.NEW_PASSWORD_LENGTH)
    }

    const patient = await this.patientRepository.findById(patientId)

    if (!patient) {
      throw new Error(MESSAGES.PATIENT_NOT_FOUND)
    }

    const isMatch = await bcrypt.compare(data.currentPassword, patient.user.passwordHash)

    if (!isMatch) {
      throw new Error(MESSAGES.INVALID_CURRENT_PASSWORD)
    }

    const passwordHash = await bcrypt.hash(data.newPassword, 10)

    await this.patientRepository.updatePassword(patientId, passwordHash)

    return { message: MESSAGES.PASSWORD_RESET_SUCCESS }
  }
}
