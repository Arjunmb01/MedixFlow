import redisClient from "../../../infrastructure/cache/redisClient";

class OtpService {

    async generateOtp(email : string) {
        const otp = Math.floor(100000 + Math.random() * 900000).toString()
        
        await redisClient.set(`otp:${email}`,otp,{
            EX:120
        })

        return otp
    }

    async verifyOtp(email:string,otp:string){
        const storedOtp = await redisClient.get(`otp:${email}`)
        if(!storedOtp) throw new Error("OTP expired")
        if(storedOtp !== otp) throw new Error ("Invalid Otp")

        await redisClient.del(`otp:${email}`)

        return true
    }

}

export default new OtpService()