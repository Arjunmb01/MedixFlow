import bcrypt from "bcryptjs";
import { MESSAGES } from "@/shared/constants";
import { IAuthRepository } from "@/domain/repositories/IAuthRepository";
import { IOtpService } from "@/domain/services/IAuthServices";
import { IEmailService } from "@/domain/services/IEmailService";

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
    private emailService: IEmailService
  ) {}

  async execute(data: SignupData) {
    const user = await this.authRepository.findUserByEmail(data.email);
    if (user) throw new Error(MESSAGES.EMAIL_ALREADY_EXISTS);

    const passwordHash = data.password ? await bcrypt.hash(data.password, 10) : "";

    const cacheData = {
      ...data,
      passwordHash
    };

    const otp = await this.otpService.generateOtp(data.email, cacheData);

    await this.emailService.sendOtpEmail(data.email, otp);

    return {
      message: MESSAGES.OTP_SENT
    };
  }
}
