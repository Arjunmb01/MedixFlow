import crypto from "crypto";
import { MESSAGES } from "@/shared/constants/index";
import { IAuthRepository } from "@/domain/repositories/IAuthRepository";
import { IEmailService } from "@/application/interfaces/IEmailService";
import { UserRole } from "@/domain/value-objects/enums/UserRole";
import { hashToken } from "@/shared/utils/hashToken";

export interface ForgotPasswordPayload {
  email: string;
}

export class ForgotPasswordUseCase {
  constructor(
    private authRepository: IAuthRepository,
    private emailService: IEmailService
  ) {}

  async execute(data: ForgotPasswordPayload) {
    const result = await this.authRepository.findUserByEmail(data.email);

    if (!result) {
      return { message: MESSAGES.FORGOT_PASSWORD_CONFIRM };
    }

    const { user } = result;

    const token = crypto.randomBytes(32).toString("hex");
    const hashedToken = hashToken(token);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); 
    await this.authRepository.createPasswordResetToken(user.id, hashedToken, expiresAt);

    let userName = "User";
    if (user.role === UserRole.PATIENT) {
      const patient = await this.authRepository.findPatientProfileByUserId(user.id);
      if (patient) userName = `${patient.firstName} ${patient.lastName}`;
    } else if (user.role === UserRole.DOCTOR) {
      const doctor = await this.authRepository.findDoctorProfileByUserId(user.id);
      if (doctor) userName = `Dr. ${doctor.lastName}`;
    }

    await this.emailService.sendForgotPasswordEmail(user.email, token, userName);

    return { message: MESSAGES.FORGOT_PASSWORD_CONFIRM };
  }

}

