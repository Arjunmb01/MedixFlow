import { MESSAGES } from "@/shared/constants";
import bcrypt from "bcryptjs";
import { IAuthRepository } from "@/domain/repositories/IAuthRepository";
import { ITokenService } from "@/domain/services/ITokenService";
import { ISessionService } from "@/domain/services/IAuthServices";

export interface LoginData {
  email: string;
  password: string;
}

export class LoginPatientUseCase {
  constructor(
    private authRepository: IAuthRepository,
    private tokenService: ITokenService,
    private sessionService: ISessionService
  ) {}

  async execute(data: LoginData) {
    const user = await this.authRepository.findUserByEmail(data.email);

    if (!user) throw new Error(MESSAGES.INVALID_ROLE_PATIENT);

    // If roles don't match, verify password to provide a helpful hint
    if (user.role !== "PATIENT") {
      const valid = await bcrypt.compare(data.password, user.passwordHash);
      if (valid) {
        if (user.role === "DOCTOR") {
          throw new Error("It looks like you have a Doctor account. Please login through the Doctor Portal.");
        }
        if (user.role === "ADMIN") {
          throw new Error("This is an Admin account. Please login through the Admin Portal.");
        }
      }
      throw new Error(MESSAGES.INVALID_ROLE_PATIENT);
    }

    if (user.status === "INACTIVE" || user.status === "SUSPENDED") {
      throw new Error(MESSAGES.ACCOUNT_BLOCKED);
    }

    const valid = await bcrypt.compare(data.password, user.passwordHash);
    if (!valid) throw new Error(MESSAGES.LOGIN_FAILED);

    const accessToken = this.tokenService.generateAccessToken(user.id, user.role, user.email);
    const refreshToken = this.tokenService.generateRefreshToken(user.id, user.role, user.email);

    await this.sessionService.saveSession(user.id, refreshToken);
    return { accessToken, refreshToken };
  }
}
