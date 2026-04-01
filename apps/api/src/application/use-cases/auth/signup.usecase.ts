import { MESSAGES } from "@/shared/constants";
import { IAuthRepository } from "@/domain/repositories/IAuthRepository";
import { IOtpService } from "@/application/interfaces/IAuthServices";
import { IEmailService } from "@/application/interfaces/IEmailService";
import { IPasswordHasher } from "@/application/interfaces/IPasswordHasher";

export interface SignupData {
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  phone: string;
}

export class SignUpUseCase {
  constructor(
    private authRepository: IAuthRepository,
    private otpService: IOtpService,
    private emailService: IEmailService,
    private passwordHasher: IPasswordHasher
  ) {}

  async execute(data: SignupData) {
    const user = await this.authRepository.findUserByEmail(data.email);
    if (user) throw new Error(MESSAGES.EMAIL_ALREADY_EXISTS);

    const passwordHash = data.password
      ? await this.passwordHasher.hash(data.password)
      : "";

    const cacheData = { ...data, passwordHash };

    const otp = await this.otpService.generateOtp(data.email, cacheData);
    await this.emailService.sendOtpEmail(data.email, otp);

    return { message: MESSAGES.OTP_SENT };
  }
}
