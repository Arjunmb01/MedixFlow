export interface ISessionService {
  saveSession(userId: string, refreshToken: string): Promise<void>;
  getSession(userId: string): Promise<string | null>;
  deleteSession(userId: string): Promise<void>;
  verifySession(userId: string, refreshToken: string): Promise<boolean>;
}

export interface RegistrationData {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  passwordHash: string;
}

export interface IOtpService {
  generateOtp(email: string, userData?: RegistrationData): Promise<string>;
  verifyOtp(email: string, otp: string): Promise<boolean>;
  getRegistrationData(email: string): Promise<RegistrationData | null>;
  clearRegistrationData(email: string): Promise<void>;
  extendRegistrationData(email: string): Promise<void>;
}
