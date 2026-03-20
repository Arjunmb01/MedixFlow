import { MESSAGES } from "@/shared/constants";
import { IAuthRepository } from "@/domain/repositories/IAuthRepository";
import { ITokenService } from "@/domain/services/ITokenService";
import { ISessionService } from "@/domain/services/IAuthServices";

export class RefreshTokenUseCase {
  constructor(
    private sessionService: ISessionService,
    private authRepository: IAuthRepository,
    private tokenService: ITokenService
  ) {}

  async execute(refreshToken: string, expectedRole: string) {
    if (!refreshToken) {
      throw new Error(MESSAGES.REFRESH_TOKEN_REQUIRED);
    }

    const payload: any = this.tokenService.verifyRefreshToken(refreshToken);
    const userId = payload.userId;
    const role = payload.role;

    if (role !== expectedRole) {
      throw new Error(MESSAGES.INVALID_ROLE_SESSION);
    }

    const storedToken = await this.sessionService.getSession(userId);
    if (!storedToken || storedToken !== refreshToken) {
      throw new Error(MESSAGES.SESSION_EXPIRED);
    }

    // Check if user is blocked/inactive using IAuthRepository
    const user = await this.authRepository.findUserById(userId);
    if (!user || user.status === "INACTIVE" || user.status === "SUSPENDED") {
      await this.sessionService.deleteSession(userId);
      throw new Error(MESSAGES.ACCOUNT_BLOCKED);
    }

    const accessToken = this.tokenService.generateAccessToken(userId, role, user.email);

    return { accessToken };
  }
}
