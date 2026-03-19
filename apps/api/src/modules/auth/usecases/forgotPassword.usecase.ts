import crypto from "crypto";
import { MESSAGES } from "../../../core/constants";
import { IAuthRepository } from "../interfaces/IAuthRepository";
import { IEmailService } from "../../../core/interfaces/IEmailService";
import { ForgotPasswordPayload } from "../dto/passwordReset.dto";

export class ForgotPasswordUseCase {
  constructor(
    private authRepository: IAuthRepository,
    private emailService: IEmailService
  ) {}

  async execute(data: ForgotPasswordPayload) {
    const user = await this.authRepository.findUserByEmail(data.email);

    if (!user) {
      return { message: MESSAGES.FORGOT_PASSWORD_CONFIRM };
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); 
    await this.authRepository.createPasswordResetToken(user.id, token, expiresAt);

    let userName = "User";
    if (user.role === "PATIENT") {
      const patient = await this.authRepository.findPatientProfileByUserId(user.id);
      if (patient) userName = `${patient.firstName} ${patient.lastName}`;
    } else if (user.role === "DOCTOR") {
      const doctor = await this.authRepository.findDoctorProfileByUserId(user.id);
      if (doctor) userName = `Dr. ${doctor.lastName}`;
    }

    await this.emailService.sendForgotPasswordEmail(user.email, token, userName);

    return { message: MESSAGES.FORGOT_PASSWORD_CONFIRM };
  }
}
