import { v4 as uuidv4 } from "uuid";
import { MESSAGES } from "@/shared/constants";
import { IAuthRepository } from "@/domain/repositories/IAuthRepository";
import { ITokenService } from "@/application/interfaces/ITokenService";
import { ISessionService } from "@/application/interfaces/IAuthServices";
import { IPasswordHasher } from "@/application/interfaces/IPasswordHasher";
import { UserRole } from "@/domain/value-objects/enums/UserRole";

export interface loginAdminData {
  email: string;
  password: string;
}

export class LoginAdminUseCase {
  constructor(
    private authRepository: IAuthRepository,
    private tokenService: ITokenService,
    private sessionService: ISessionService,
    private passwordHasher: IPasswordHasher
  ) {}

  async execute(data: loginAdminData) {
    const result = await this.authRepository.findUserByEmail(data.email);

    if (!result) throw new Error(MESSAGES.INVALID_ROLE_ADMIN);

    const { user } = result;

    if (user.role !== UserRole.ADMIN) throw new Error(MESSAGES.INVALID_ROLE_ADMIN);

    const valid = await this.passwordHasher.compare(data.password, user.passwordHash);
    if (!valid) throw new Error(MESSAGES.LOGIN_FAILED);

<<<<<<< HEAD
    const accessToken = this.tokenService.generateAccessToken(user.id, user.role as UserRole, user.email);
    const refreshToken = this.tokenService.generateRefreshToken(user.id, user.role as UserRole, user.email);
    await this.sessionService.saveSession(user.id, user.role as UserRole, refreshToken);
=======
    const sessionId = uuidv4();
    const accessToken = this.tokenService.generateAccessToken(user.id, user.role as UserRole, user.email, sessionId);
    const refreshToken = this.tokenService.generateRefreshToken(user.id, user.role as UserRole, user.email, sessionId);
    await this.sessionService.saveSession(user.id, user.role as UserRole, refreshToken, sessionId);
>>>>>>> 141ec674faa5e8dec8f62adfdfa63bd47aaf7909

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
