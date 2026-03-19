import { prisma } from "../../../infrastructure/database/prismaClient";
import { Role, UserStatus } from "@prisma/client";
import { PatientIdGenerator } from "../services/PatientIdGenerator";
import { IAuthRepository } from "../interfaces/IAuthRepository";

export interface CreateUserData {
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  phone: string;
}

export interface CreateGoogleUserData {
  email: string;
  firstName: string;
  lastName: string;
}

export class AuthRepository implements IAuthRepository {
  async findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async createPatient(data: CreateUserData) {
    const patientId = await PatientIdGenerator.generate();
    return prisma.user.create({
      data: {
        email: data.email,
        passwordHash: data.passwordHash,
        role: Role.PATIENT,
        status: UserStatus.ACTIVE,
        patientProfile: {
          create: {
            patientId,
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
          },
        },
      },
    });
  }

  async createGooglePatient(data: CreateGoogleUserData) {
    const patientId = await PatientIdGenerator.generate();
    return prisma.user.create({
      data: {
        email: data.email,
        passwordHash: "",
        role: Role.PATIENT,
        status: UserStatus.ACTIVE,
        patientProfile: {
          create: {
            patientId,
            firstName: data.firstName,
            lastName: data.lastName,
            phone: "",
          },
        },
      },
    });
  }

  async activateUser(email: string) {
    return prisma.user.update({
      where: { email },
      data: { status: UserStatus.ACTIVE },
    });
  }

  async createPasswordResetToken(userId: string, token: string, expiresAt: Date) {
    return prisma.passwordResetToken.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    });
  }

  async findPasswordResetToken(token: string) {
    return prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });
  }

  async deletePasswordResetToken(token: string) {
    return prisma.passwordResetToken.delete({
      where: { token },
    });
  }

  async updateUserPassword(userId: string, passwordHash: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
  }

  async findPatientProfileByUserId(userId: string) {
    return prisma.patientProfile.findUnique({
      where: { id: userId },
    });
  }

  async findDoctorProfileByUserId(userId: string) {
    return prisma.doctorProfile.findUnique({
      where: { id: userId },
    });
  }

  async findUserById(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
    });
  }
}

export default new AuthRepository(); // Keep for backward compatibility if needed, but we'll migrate usecases.