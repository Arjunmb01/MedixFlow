import bcrypt from "bcryptjs"
import authRepository from "../repositories/auth.repository"
import otpServices from "../services/otp.services"
import emailService from "../../../infrastructure/email/email.service"
import { SignupData, RegisterCacheData } from "../types/auth.types"

class SignUpUseCase {

  async execute(data: SignupData) {

    const user = await authRepository.findUserByEmail(data.email)
    if (user) throw new Error("Email already exists")

    const passwordHash = await bcrypt.hash(data.password, 10)

    const cacheData: RegisterCacheData = {
      ...data,
      passwordHash
    }

    const otp = await otpServices.generateOtp(data.email, cacheData)

    await emailService.sendOtpEmail(data.email, otp)

    return {
      message: "OTP sent. Please verify to complete registration."
    }
  }

}

export default new SignUpUseCase()