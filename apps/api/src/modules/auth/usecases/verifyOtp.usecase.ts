import otpServices from "../services/otp.services";
import authRepository from "../repositories/auth.repository";

export interface VerifyOtpData {
    email: string;
    otp: string
}

class verifyOtpUseCase {
    async execute(data: VerifyOtpData) {

        await otpServices.verifyOtp(data.email, data.otp)

        const userData = await otpServices.getRegistrationData(data.email)
        if (!userData) {
            throw new Error("Registration session has expired. Please sign up again.")
        }

        await authRepository.createPatient(userData)
        await otpServices.clearRegistrationData(data.email)

        return { message: "Account verified and created successfully" }
    }
}

export default new verifyOtpUseCase()