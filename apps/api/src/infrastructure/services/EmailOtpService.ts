import { MESSAGES } from "@/shared/constants";
import { IOtpService, RegistrationData } from "@/application/interfaces/IAuthServices";
import { IEmailService } from "@/application/interfaces/IEmailService";
import { IRedisClient } from "@/infrastructure/interfaces/IRedisClient";

export class EmailOtpService implements IOtpService {
  constructor(
    private readonly redisClient: IRedisClient,
    private readonly emailService: IEmailService
  ) { }

  async generateOtp(email: string, userData?: RegistrationData): Promise<string> {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await this.redisClient.set(`otp:${email}`, otp, {
      EX: 120
    });

    if (userData) {
      await this.redisClient.set(
        `registerData:${email}`,
        JSON.stringify(userData),
        { EX: 120 }
      );
    }

    console.log(`[OTP Service] Generated OTP for ${email}: ${otp}`);

    return otp;
  }

  async verifyOtp(email: string, otp: string | number) {
    const storedOtp = await this.redisClient.get(`otp:${email}`);

    if (!storedOtp) {
      throw new Error(MESSAGES.OTP_EXPIRED_SIMPLE)
    }
    if (String(otp) !== String(storedOtp)) {
      throw new Error(MESSAGES.INVALID_OTP)
    }

    await this.redisClient.del(`otp:${email}`);
    return true;
  }

  async getRegistrationData(email: string): Promise<RegistrationData | null> {
    const data = await this.redisClient.get(`registerData:${email}`);

    if (!data) return null;

    return JSON.parse(data) as RegistrationData;
  }

  async clearRegistrationData(email: string) {
    await this.redisClient.del(`registerData:${email}`);
  }

  async extendRegistrationData(email: string) {
    const data = await this.redisClient.get(`registerData:${email}`);

    if (data) {
      await this.redisClient.set(`registerData:${email}`, data, {
        EX: 120
      });
    }
  }
}

