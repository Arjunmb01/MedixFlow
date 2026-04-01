import { MESSAGES } from "@/shared/constants";
import { IAuthRepository } from "@/domain/repositories/IAuthRepository";
import { IPasswordHasher } from "@/application/interfaces/IPasswordHasher";

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

    const resetToken = await this.authRepository.findPasswordResetToken(token);

    if (!resetToken || (resetToken.expiresAt && resetToken.expiresAt < new Date())) {
      throw new Error(MESSAGES.INVALID_RESET_TOKEN);
    }

    const passwordHash = await this.passwordHasher.hash(password);

    await this.authRepository.updateUserPassword(resetToken.userId, passwordHash);
    await this.authRepository.deletePasswordResetToken(token);

    return { message: MESSAGES.PASSWORD_RESET_SUCCESS };
  }
}
