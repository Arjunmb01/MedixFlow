import { MESSAGES } from "@/shared/constants";
import { IPatientRepository } from "@/domain/repositories/IPatientRepository";
import { IPasswordHasher } from "@/application/interfaces/IPasswordHasher";

export class UpdatePasswordUseCase {
  constructor(
    private patientRepository: IPatientRepository,
    private passwordHasher: IPasswordHasher
  ) {}

  async execute(
    patientId: string,
    data: { currentPassword?: string; newPassword?: string }
  ): Promise<{ message: string }> {
    const { currentPassword, newPassword } = data;

    if (!currentPassword || !newPassword) {
      throw new Error("Current and new password are required");
    }

    if (newPassword.length < 8) {
      throw new Error(MESSAGES.NEW_PASSWORD_LENGTH);
    }

    const patient = await this.patientRepository.findById(patientId);

    if (!patient) {
      throw new Error(MESSAGES.PATIENT_NOT_FOUND);
    }

    if (!patient.passwordHash) {
      throw new Error("Cannot verify current password: No hash found.");
    }

    const isMatch = await this.passwordHasher.compare(currentPassword, patient.passwordHash);

    if (!isMatch) {
      throw new Error(MESSAGES.INVALID_CURRENT_PASSWORD);
    }

    const passwordHash = await this.passwordHasher.hash(newPassword);
    await this.patientRepository.updatePassword(patientId, passwordHash);

    return { message: MESSAGES.PASSWORD_RESET_SUCCESS };
  }
}
