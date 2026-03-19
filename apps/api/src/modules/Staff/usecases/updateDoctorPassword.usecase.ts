import { IDoctorRepository } from "../interfaces/IDoctorRepository";
import { MESSAGES } from "../../../core/constants";
import bcrypt from "bcryptjs";

export class UpdateDoctorPasswordUseCase {
  constructor(private doctorRepository: IDoctorRepository) {}

  async execute(userId: string, data: { currentPassword?: string; newPassword?: string }) {
    const { currentPassword, newPassword } = data;

    if (!currentPassword || !newPassword) {
      throw new Error(MESSAGES.CURRENT_NEW_PASSWORD_REQUIRED);
    }

    if (newPassword.length < 8) {
      throw new Error(MESSAGES.NEW_PASSWORD_LENGTH);
    }

    const doctor = await this.doctorRepository.findById(userId);
    if (!doctor) {
      throw new Error(MESSAGES.USER_NOT_FOUND);
    }

    const valid = await bcrypt.compare(currentPassword, doctor.user.passwordHash);
    if (!valid) {
      throw new Error(MESSAGES.CURRENT_PASSWORD_INCORRECT);
    }

    const hash = await bcrypt.hash(newPassword, 10);
    return this.doctorRepository.updatePassword(userId, hash);
  }
}
