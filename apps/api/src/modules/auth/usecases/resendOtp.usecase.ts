import authRepository from '../repositories/auth.repository';
import otpServices from '../services/otp.services';
import { UserStatus } from "@prisma/client";

class ResendOtpUseCase {
  async execute(email: string) {
    const user = await authRepository.findUserByEmail(email);

    if (user && user.status === UserStatus.ACTIVE) {
      throw new Error("User is already registered and verified");
    }

    const tempRegData = await otpServices.getRegistrationData(email);
    if (!tempRegData && !user) {
        throw new Error("Registration session expired or does not exist. Please sign up again.");
    }

    const otp = await otpServices.generateOtp(email);
    console.log(otp)

    if (tempRegData) {
        await otpServices.extendRegistrationData(email);
    }

    return {
      message: "OTP resent successfully",
      otp 
    };
  }
}

export default new ResendOtpUseCase();
