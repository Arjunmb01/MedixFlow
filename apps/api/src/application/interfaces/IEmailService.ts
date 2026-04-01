export interface SmtpConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
  frontendUrl: string;
}

export interface IEmailService {
  sendOtpEmail(to: string, otp: string): Promise<void>;
  sendSetPasswordEmail(to: string, token: string, doctorName: string): Promise<void>;
  sendDoctorCredentialsEmail(to: string, doctorName: string, tempPassword: string): Promise<void>;
  sendForgotPasswordEmail(to: string, token: string, userName: string): Promise<void>;
}
