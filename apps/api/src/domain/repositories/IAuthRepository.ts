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

export interface UserWithProfile {
  user: User;
  patientId: string;
}

// ─── Repository contract ──────────────────────────────────────────────────
export interface IAuthRepository {
  findUserByEmail(email: string): Promise<UserWithProfile | null>;
  createPatient(data: {
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    phone: string;
  }): Promise<UserWithProfile>;
  createGooglePatient(data: {
    email: string;
    firstName: string;
    lastName: string;
  }): Promise<UserWithProfile>;
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
  findUserById(userId: string): Promise<UserWithProfile | null>;
}

