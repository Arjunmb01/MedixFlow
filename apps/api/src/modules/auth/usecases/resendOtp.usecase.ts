import authRepository from '../repositories/auth.repository';
import otpServices from '../services/otp.services';
import { UserStatus } from "@prisma/client";

class ResendOtpUseCase {
  async execute(email: string) {
    const user = await authRepository.findUserByEmail(email);

    if (!user) {
      throw new Error("User not found");
    }

    if (user.status === UserStatus.ACTIVE) {
      throw new Error("User is already verified");
    }

    const otp = await otpServices.generateOtp(email);

    return {
      message: "OTP resent successfully",
      otp // In a real app, this would be sent via email
    };
  }
}

export default new ResendOtpUseCase();
