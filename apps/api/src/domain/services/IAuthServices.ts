export interface ISessionService {
  saveSession(userId: string, refreshToken: string): Promise<void>;
  getSession(userId: string): Promise<string | null>;
  deleteSession(userId: string): Promise<void>;
  verifySession(userId: string, refreshToken: string): Promise<boolean>;
}

export interface IOtpService {
  generateOtp(email: string, userData?: any): Promise<string>;
  verifyOtp(email: string, otp: string): Promise<boolean>;
  getRegistrationData(email: string): Promise<any>;
  clearRegistrationData(email: string): Promise<void>;
  extendRegistrationData(email: string): Promise<void>;
}
