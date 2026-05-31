import { MESSAGES } from "@/shared/constants";
import { IAuthRepository } from "@/domain/repositories/IAuthRepository";
import { ITokenService } from "@/application/interfaces/ITokenService";
import { ISessionService } from "@/application/interfaces/IAuthServices";

import { UserRole } from "@/domain/value-objects/enums/UserRole";
import { TokenPayload } from "@/application/interfaces/ITokenService";

export class RefreshTokenUseCase {
  constructor(
    private sessionService: ISessionService,
    private authRepository: IAuthRepository,
    private tokenService: ITokenService
  ) {}

  async execute(refreshToken: string, expectedRole: UserRole) {
    if (!refreshToken) {
      throw new Error(MESSAGES.REFRESH_TOKEN_REQUIRED);
    }

    const payload: TokenPayload = this.tokenService.verifyRefreshToken(refreshToken);
    const userId = payload.id;
    const role = payload.role;

    const sessionId = payload.sessionId;

    if (role !== expectedRole) {
      throw new Error(MESSAGES.INVALID_ROLE_SESSION);
    }

<<<<<<< HEAD
    const storedToken = await this.sessionService.getSession(userId, expectedRole);
=======
    const storedToken = await this.sessionService.getSession(userId, expectedRole, sessionId);
>>>>>>> 141ec674faa5e8dec8f62adfdfa63bd47aaf7909
    if (!storedToken || storedToken !== refreshToken) {
      throw new Error(MESSAGES.SESSION_EXPIRED);
    }

    // Check if user is blocked/inactive using IAuthRepository
    const result = await this.authRepository.findUserById(userId);
    if (!result) {
<<<<<<< HEAD
      await this.sessionService.deleteSession(userId, expectedRole);
=======
      await this.sessionService.deleteSession(userId, expectedRole, sessionId);
>>>>>>> 141ec674faa5e8dec8f62adfdfa63bd47aaf7909
      throw new Error(MESSAGES.ACCOUNT_BLOCKED);
    }

    const { user, patientId } = result;
    if (user.status === "INACTIVE" || user.status === "SUSPENDED") {
<<<<<<< HEAD
      await this.sessionService.deleteSession(userId, expectedRole);
=======
      await this.sessionService.deleteSession(userId, expectedRole, sessionId);
>>>>>>> 141ec674faa5e8dec8f62adfdfa63bd47aaf7909
      throw new Error(MESSAGES.ACCOUNT_BLOCKED);
    }

    const accessToken = this.tokenService.generateAccessToken(userId, role as UserRole, user.email, sessionId);

    return { accessToken, patientId };

  }
}

