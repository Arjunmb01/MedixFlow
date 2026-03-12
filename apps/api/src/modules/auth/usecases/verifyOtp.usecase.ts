import otpServices from "../services/otp.services";
import authRepository from "../repositories/auth.repository";

export interface VerifyOtpData {
    email :string;
    otp:string
}

class verifyOtpUseCase {
    async execute(data :VerifyOtpData){

        await otpServices.verifyOtp(data.email,data.otp)
        await authRepository.activateUser(data.email)
        return {message : "Account verified"}
    }
}


export default new verifyOtpUseCase()