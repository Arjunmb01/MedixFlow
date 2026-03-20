import { MESSAGES } from "@/shared/constants";
import { IAuthRepository } from "@/domain/repositories/IAuthRepository";
import { IOtpService } from "@/domain/services/IAuthServices";
import { IEmailService } from "@/domain/services/IEmailService";

export class ResendOtpUseCase {
  constructor(
    private authRepository: IAuthRepository,
    private otpService: IOtpService,
    private emailService: IEmailService
  ) {}

  async execute(email: string) {
    const user = await this.authRepository.findUserByEmail(email);

    if (user && user.status === "ACTIVE") {
      throw new Error(MESSAGES.ALREADY_REGISTERED);
    }

    const tempRegData = await this.otpService.getRegistrationData(email);
    if (!tempRegData && !user) {
        throw new Error(MESSAGES.OTP_EXPIRED);
    }

    const otp = await this.otpService.generateOtp(email);

    if (tempRegData) {
        await this.otpService.extendRegistrationData(email);
    }

    await this.emailService.sendOtpEmail(email, otp);

    return {
      message: MESSAGES.OTP_RESENT,
    };
  }
}
