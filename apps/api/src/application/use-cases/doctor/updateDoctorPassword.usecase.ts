import { IDoctorProfileRepository } from "@/domain/repositories/IDoctorRepository";
import { MESSAGES } from "@/shared/constants";
import { IPasswordHasher } from "@/application/interfaces/IPasswordHasher";

export class UpdateDoctorPasswordUseCase {
  constructor(
    private doctorRepository: IDoctorProfileRepository,
    private passwordHasher: IPasswordHasher
  ) {}

  async execute(
    userId: string,
    data: { currentPassword?: string; newPassword?: string }
  ): Promise<void> {
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

    if (!doctor.passwordHash) {
      throw new Error("Cannot verify current password: No hash found.");
    }

    const valid = await this.passwordHasher.compare(currentPassword, doctor.passwordHash);
    if (!valid) {
      throw new Error(MESSAGES.CURRENT_PASSWORD_INCORRECT);
    }

    const hash = await this.passwordHasher.hash(newPassword);
    await this.doctorRepository.updatePassword(userId, hash);
  }
}
