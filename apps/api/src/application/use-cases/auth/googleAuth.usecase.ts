import { MESSAGES } from "@/shared/constants";
import { IAuthRepository } from "@/domain/repositories/IAuthRepository";
import { ITokenService } from "@/application/interfaces/ITokenService";
import { ISessionService } from "@/application/interfaces/IAuthServices";
import { IGoogleAuthService } from "@/application/interfaces/IGoogleAuthService";
import { UserRole } from "@/domain/value-objects/enums/UserRole";

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

    let result = await this.authRepository.findUserByEmail(email);

    if (result) {
      if (result.user.role !== UserRole.PATIENT) {
        if (result.user.role === UserRole.DOCTOR) throw new Error("It looks like you have a Doctor account. Please login through the Doctor Portal.");
        if (result.user.role === UserRole.ADMIN) throw new Error("This is an Admin account. Please login through the Admin Portal.");
        throw new Error(MESSAGES.INVALID_ROLE_PATIENT);
      }
    } else {
      result = await this.authRepository.createGooglePatient({
        email,
        firstName,
        lastName,
      });
    }

    const { user, patientId } = result;

    if (user.status === "INACTIVE" || user.status === "SUSPENDED") {
      throw new Error(MESSAGES.ACCOUNT_BLOCKED);
    }

    const accessToken = this.tokenService.generateAccessToken(user.id, user.role as UserRole, user.email);
    const refreshToken = this.tokenService.generateRefreshToken(user.id, user.role as UserRole, user.email);

    await this.sessionService.saveSession(user.id, user.role as UserRole, refreshToken);

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

