import { UserRole } from "@/domain/value-objects/enums/UserRole";

export interface ISessionService {
<<<<<<< HEAD
  saveSession(userId: string, role: UserRole, refreshToken: string): Promise<void>;
  getSession(userId: string, role: UserRole): Promise<string | null>;
  deleteSession(userId: string, role: UserRole): Promise<void>;
  verifySession(userId: string, role: UserRole, refreshToken: string): Promise<boolean>;
=======
  saveSession(userId: string, role: UserRole, refreshToken: string, sessionId: string): Promise<void>;
  getSession(userId: string, role: UserRole, sessionId: string): Promise<string | null>;
  deleteSession(userId: string, role: UserRole, sessionId: string): Promise<void>;
  deleteAllSessions(userId: string, role: UserRole): Promise<void>;
  verifySession(userId: string, role: UserRole, sessionId: string, refreshToken: string): Promise<boolean>;
>>>>>>> 141ec674faa5e8dec8f62adfdfa63bd47aaf7909
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
