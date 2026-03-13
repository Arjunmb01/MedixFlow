import redisClient from "../../../infrastructure/cache/redisClient";
import { SignupData } from "../usecases/signup.usecase";

class OtpService {

    async generateOtp(email: string, userData?: SignupData & { passwordHash?: string }) {
        const otp = Math.floor(100000 + Math.random() * 900000).toString()
        await redisClient.set(`otp:${email}`, otp, {
            EX: 120
        })

        if (userData) {
            await redisClient.set(`registerData:${email}`, JSON.stringify(userData), {
                EX: 120
            });
        }

        console.log(`[OTP Service] Generated OTP for ${email}: ${otp}`);

        return otp
    }

    async verifyOtp(email: string, otp: string) {
        const storedOtp = await redisClient.get(`otp:${email}`)
        if (!storedOtp) throw new Error("OTP expired")
        if (storedOtp !== otp) throw new Error("Invalid Otp")

        await redisClient.del(`otp:${email}`)

        return true
    }

    async getRegistrationData(email: string) {
        const data = await redisClient.get(`registerData:${email}`);
        if (!data) return null;
        return JSON.parse(data) as SignupData & { passwordHash: string };
    }

    async clearRegistrationData(email: string) {
        await redisClient.del(`registerData:${email}`);
    }

    async extendRegistrationData(email: string) {
        const data = await redisClient.get(`registerData:${email}`);
        if (data) {
            await redisClient.set(`registerData:${email}`, data, { EX: 120 });
        }
    }

}

export default new OtpService()