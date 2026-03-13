import {prisma} from "../../../infrastructure/database/prismaClient";
import { Role, UserStatus } from "@prisma/client";

interface CreateUserData {
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  phone: string;
}

class AuthRepository {
  findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async createPatient(data: CreateUserData) {
    return prisma.user.create({
      data: {
        email: data.email,
        passwordHash: data.passwordHash,
        role: Role.PATIENT,
        status: UserStatus.ACTIVE,
        patientProfile: {
          create: {
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
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