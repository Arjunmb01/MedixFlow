import bcrypt from "bcryptjs"
import { MESSAGES } from "../../../core/constants";
import { IAuthRepository } from "../interfaces/IAuthRepository";
import { IOtpService } from "../interfaces/IOtpService";
import { IEmailService } from "../../../core/interfaces/IEmailService";
import { SignupData, RegisterCacheData } from "../types/auth.types"

export class SignUpUseCase {
  constructor(
    private authRepository: IAuthRepository,
    private otpService: IOtpService,
    private emailService: IEmailService
  ) {}

  async execute(data: SignupData) {
    const user = await this.authRepository.findUserByEmail(data.email)
    if (user) throw new Error(MESSAGES.EMAIL_ALREADY_EXISTS)

    const passwordHash = await bcrypt.hash(data.password, 10)

    const cacheData: RegisterCacheData = {
      ...data,
      passwordHash
    }

    const otp = await this.otpService.generateOtp(data.email, cacheData)

    await this.emailService.sendOtpEmail(data.email, otp)

    return {
      message: MESSAGES.OTP_SENT
    }
  }
}