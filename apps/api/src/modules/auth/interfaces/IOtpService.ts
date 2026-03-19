export interface IOtpService {
  generateOtp(email: string, userData?: any): Promise<string>;
  verifyOtp(email: string, otp: string): Promise<boolean>;
  getRegistrationData(email: string): Promise<any>;
  clearRegistrationData(email: string): Promise<void>;
  extendRegistrationData(email: string): Promise<void>;
}
