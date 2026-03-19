import bcrypt from "bcryptjs";
import { MESSAGES } from "../../../core/constants";
import { IAuthRepository } from "../interfaces/IAuthRepository";
import { ResetPasswordPayload } from "../dto/passwordReset.dto";

export class ResetPasswordUseCase {
  constructor(private authRepository: IAuthRepository) {}

  async execute(data: ResetPasswordPayload) {
    const { token, password } = data;

    const resetToken = await this.authRepository.findPasswordResetToken(token);

    if (!resetToken || (resetToken.expiresAt && resetToken.expiresAt < new Date())) {
      throw new Error(MESSAGES.INVALID_RESET_TOKEN);
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await this.authRepository.updateUserPassword(resetToken.userId, passwordHash);
    await this.authRepository.deletePasswordResetToken(token);

    return { message: MESSAGES.PASSWORD_RESET_SUCCESS };
  }
}
