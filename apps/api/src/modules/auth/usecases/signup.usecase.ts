import bcrypt from 'bcryptjs'
import authRepository from '../repositories/auth.repository'
import otpServices from '../services/otp.services'

export interface SignupData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
}

class SignUpUseCase {

    async execute(data: SignupData) {
        const user = await authRepository.findUserByEmail(data.email)
        if (user) throw new Error("Email already exists")

        const passwordHash = await bcrypt.hash(data.password, 10)

        await authRepository.createPatient({
            ...data,
            passwordHash
        });

        const otp = await otpServices.generateOtp(data.email)

        return {
            message: "OTP sent",
            otp
        }
    }
}

export default new SignUpUseCase()