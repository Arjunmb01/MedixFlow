import { MESSAGES } from "@/shared/constants";
import { IAuthRepository } from "@/domain/repositories/IAuthRepository";
import { ITokenService } from "@/application/interfaces/ITokenService";
import { ISessionService } from "@/application/interfaces/IAuthServices";
import { IGoogleAuthService } from "@/application/interfaces/IGoogleAuthService";

export class GoogleAuthUseCase {
  constructor(
    private authRepository: IAuthRepository,
    private tokenService: ITokenService,
    private sessionService: ISessionService,
    private googleAuthService: IGoogleAuthService
  ) {}

  async execute(idToken: string) {
    const googleUser = await this.googleAuthService.verifyToken(idToken);
    
    const { email, firstName, lastName } = googleUser;

    let user = await this.authRepository.findUserByEmail(email);

    if (user) {
      if (user.role !== "PATIENT") {
        if (user.role === "DOCTOR") throw new Error("It looks like you have a Doctor account. Please login through the Doctor Portal.");
        if (user.role === "ADMIN") throw new Error("This is an Admin account. Please login through the Admin Portal.");
        throw new Error(MESSAGES.INVALID_ROLE_PATIENT);
      }
    } else {
      user = await this.authRepository.createGooglePatient({
        email,
        firstName,
        lastName,
      });
    }

    if (user.status === "INACTIVE" || user.status === "SUSPENDED") {
      throw new Error(MESSAGES.ACCOUNT_BLOCKED);
    }

    const accessToken = this.tokenService.generateAccessToken(user.id, user.role, user.email);
    const refreshToken = this.tokenService.generateRefreshToken(user.id, user.role, user.email);

    await this.sessionService.saveSession(user.id, refreshToken);

    return { accessToken, refreshToken };
  }
}

