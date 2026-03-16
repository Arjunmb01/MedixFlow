import {prisma} from "../../../infrastructure/database/prismaClient";
import { Role, UserStatus } from "@prisma/client";
import { PatientIdGenerator } from "../services/PatientIdGenerator";

interface CreateUserData {
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  phone: string;
}

interface CreateGoogleUserData {
  email: string;
  firstName: string;
  lastName: string;
}

class AuthRepository {
  findUserByEmail(email: string) {
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

  activateUser(email: string) {
    return prisma.user.update({
      where: { email },
      data: { status: UserStatus.ACTIVE },
    });
  }
}

export default new AuthRepository();