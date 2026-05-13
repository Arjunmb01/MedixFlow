import { v4 as uuidv4 } from "uuid";
import { MESSAGES } from "@/shared/constants";
import { IAuthRepository } from "@/domain/repositories/IAuthRepository";
import { ITokenService } from "@/application/interfaces/ITokenService";
import { ISessionService } from "@/application/interfaces/IAuthServices";
import { IPasswordHasher } from "@/application/interfaces/IPasswordHasher";
import { UserRole } from "@/domain/value-objects/enums/UserRole";

export interface LoginDoctorData {
  email: string;
  password: string;
}

export class LoginDoctorUseCase {
  constructor(
    private authRepository: IAuthRepository,
    private tokenService: ITokenService,
    private sessionService: ISessionService,
    private passwordHasher: IPasswordHasher
  ) {}

  async execute(data: LoginDoctorData) {
    const result = await this.authRepository.findUserByEmail(data.email);

    if (!result) throw new Error(MESSAGES.LOGIN_FAILED);

    const { user } = result;

    if (user.role !== UserRole.DOCTOR) throw new Error(MESSAGES.LOGIN_FAILED);

    if (user.status === "INACTIVE") {
      throw new Error(MESSAGES.ACCOUNT_BLOCKED);
    }

    if (user.status === "SUSPENDED") {
      throw new Error(MESSAGES.ACCOUNT_SUSPENDED);
    }

    const valid = await this.passwordHasher.compare(data.password, user.passwordHash);
    if (!valid) throw new Error(MESSAGES.LOGIN_FAILED);

    const sessionId = uuidv4();
    const accessToken = this.tokenService.generateAccessToken(user.id, user.role as UserRole, user.email, sessionId);
    const refreshToken = this.tokenService.generateRefreshToken(user.id, user.role as UserRole, user.email, sessionId);

    await this.sessionService.saveSession(user.id, user.role as UserRole, refreshToken, sessionId);

    return { 
      accessToken, 
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    };
  }

}

