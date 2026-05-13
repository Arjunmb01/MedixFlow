import { v4 as uuidv4 } from "uuid";
import { MESSAGES } from "@/shared/constants";
import { IAuthRepository } from "@/domain/repositories/IAuthRepository";
import { ITokenService } from "@/application/interfaces/ITokenService";
import { ISessionService } from "@/application/interfaces/IAuthServices";
import { IPasswordHasher } from "@/application/interfaces/IPasswordHasher";
import { UserRole } from "@/domain/value-objects/enums/UserRole";

export interface LoginData {
  email: string;
  password: string;
}

export class LoginPatientUseCase {
  constructor(
    private authRepository: IAuthRepository,
    private tokenService: ITokenService,
    private sessionService: ISessionService,
    private passwordHasher: IPasswordHasher
  ) {}

  async execute(data: LoginData) {
    const result = await this.authRepository.findUserByEmail(data.email);

    if (!result) throw new Error(MESSAGES.INVALID_ROLE_PATIENT);

    const { user, patientId } = result;

    // Role mismatch: verify password before giving a helpful hint
    if (user.role !== UserRole.PATIENT) {
      const valid = await this.passwordHasher.compare(data.password, user.passwordHash);
      if (valid) {
        if (user.role === UserRole.DOCTOR) {
          throw new Error(
            "It looks like you have a Doctor account. Please login through the Doctor Portal."
          );
        }
        if (user.role === UserRole.ADMIN) {
          throw new Error(
            "This is an Admin account. Please login through the Admin Portal."
          );
        }
      }
      throw new Error(MESSAGES.INVALID_ROLE_PATIENT);
    }

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
      patientId,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    };
  }

}
