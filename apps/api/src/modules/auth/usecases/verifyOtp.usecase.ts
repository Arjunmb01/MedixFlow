import { MESSAGES } from "../../../core/constants";
import { IOtpService } from "../interfaces/IOtpService";
import { IAuthRepository } from "../interfaces/IAuthRepository";

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