import { User } from "../entities/User";

// ─── Lightweight domain shapes — NO Prisma ────────────────────────────────
export interface DomainPatientProfile {
  id: string;
  patientId: string;
  firstName: string;
  lastName: string;
  phone: string;
}

export interface DomainDoctorProfile {
  id: string;
  firstName: string;
  lastName: string;
}

export interface DomainPasswordResetToken {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  user: User;
}

// ─── Repository contract ──────────────────────────────────────────────────
export interface IAuthRepository {
  findUserByEmail(email: string): Promise<User | null>;
  createPatient(data: {
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    phone: string;
  }): Promise<User>;
  createGooglePatient(data: {
    email: string;
    firstName: string;
    lastName: string;
  }): Promise<User>;
  activateUser(email: string): Promise<void>;
  createPasswordResetToken(
    userId: string,
    token: string,
    expiresAt: Date
  ): Promise<DomainPasswordResetToken>;
  findPasswordResetToken(token: string): Promise<DomainPasswordResetToken | null>;
  deletePasswordResetToken(token: string): Promise<void>;
  updateUserPassword(userId: string, passwordHash: string): Promise<void>;
  findPatientProfileByUserId(userId: string): Promise<DomainPatientProfile | null>;
  findDoctorProfileByUserId(userId: string): Promise<DomainDoctorProfile | null>;
  findUserById(userId: string): Promise<User | null>;
}
