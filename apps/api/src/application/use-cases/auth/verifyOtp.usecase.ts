import { MESSAGES } from "@/shared/constants";
import { IOtpService } from "@/application/interfaces/IAuthServices";
import { IAuthRepository } from "@/domain/repositories/IAuthRepository";

export interface VerifyOtpData {
    email: string;
    otp: string
}

export class VerifyOtpUseCase {
    constructor(
        private authRepository: IAuthRepository,
        private otpService: IOtpService
    ) {}

    async execute(data: VerifyOtpData) {
        await this.otpService.verifyOtp(data.email, data.otp)

        const userData = await this.otpService.getRegistrationData(data.email)
        if (!userData) {
            throw new Error(MESSAGES.OTP_EXPIRED)
        }

        await this.authRepository.createPatient(userData)
        await this.otpService.clearRegistrationData(data.email)

        return { message: MESSAGES.OTP_VERIFIED }
    }
}

