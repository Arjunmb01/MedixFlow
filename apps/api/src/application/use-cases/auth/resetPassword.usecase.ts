import { MESSAGES } from "@/shared/constants";
import { IAuthRepository } from "@/domain/repositories/IAuthRepository";
import { IPasswordHasher } from "@/application/interfaces/IPasswordHasher";
import { hashToken } from "@/shared/utils/hashToken";

export interface ResetPasswordPayload {
  token: string;
  password: string;
}

export class ResetPasswordUseCase {
  constructor(
    private authRepository: IAuthRepository,
    private passwordHasher: IPasswordHasher
  ) {}

  async execute(data: ResetPasswordPayload) {
    const { token, password } = data;
    const hashedToken = hashToken(token);

    const resetToken = await this.authRepository.findPasswordResetToken(hashedToken);

    if (!resetToken || (resetToken.expiresAt && resetToken.expiresAt < new Date())) {
      throw new Error(MESSAGES.INVALID_RESET_TOKEN);
    }

    const passwordHash = await this.passwordHasher.hash(password);

    await this.authRepository.updateUserPassword(resetToken.userId, passwordHash);
    await this.authRepository.deletePasswordResetToken(hashedToken);

    return { message: MESSAGES.PASSWORD_RESET_SUCCESS };
  }
}
