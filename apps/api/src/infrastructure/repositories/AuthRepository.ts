import { PrismaClient, Role, UserStatus } from "@prisma/client";
import { IAuthRepository, DomainPasswordResetToken, DomainPatientProfile, DomainDoctorProfile, UserWithProfile } from "@/domain/repositories/IAuthRepository";
import { User } from "@/domain/entities/User";
import { PatientIdGenerator } from "../services/PatientIdGenerator";

export class AuthRepository implements IAuthRepository {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly patientIdGenerator: PatientIdGenerator
  ) { }

  private toUser(raw: { id: string; email: string; role: string; status: string; passwordHash: string; createdAt: Date }): User {
    return new User(raw.id, raw.email, raw.role, raw.status, raw.passwordHash, raw.createdAt);
  }

  async findUserByEmail(email: string): Promise<UserWithProfile | null> {
    const raw = await this.prisma.user.findUnique({
      where: { email },
      include: { patientProfile: true }
    });
    if (!raw) return null;

    let patientId = "";
    if (raw.role === Role.PATIENT) {
      if (!raw.patientProfile) {
        const generatedId = await this.patientIdGenerator.generate();
        const profile = await this.prisma.patientProfile.create({
          data: {
            id: raw.id,
            patientId: generatedId,
            firstName: "Patient",
            lastName: "User",
            phone: "",
          }
        });
        patientId = profile.patientId;
      } else {
        patientId = raw.patientProfile.patientId;
      }
    }

    return {
      user: this.toUser(raw),
      patientId
    };
  }

  async createPatient(data: {
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    phone: string;
  }): Promise<UserWithProfile> {
    const patientId = await this.patientIdGenerator.generate();
    const raw = await this.prisma.user.create({
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
      include: {
        patientProfile: true
      },
    });
    return {
      user: this.toUser(raw),
      patientId: raw.patientProfile!.patientId
    }
  }

  async createGooglePatient(data: {
    email: string;
    firstName: string;
    lastName: string;
  }): Promise<UserWithProfile> {
    const patientId = await this.patientIdGenerator.generate();
    const raw = await this.prisma.user.create({
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
      include: {
        patientProfile: true
      },
    });
    return {
      user: this.toUser(raw),
      patientId: raw.patientProfile!.patientId
    };
  }


  async activateUser(email: string): Promise<void> {
    await this.prisma.user.update({
      where: { email },
      data: { status: UserStatus.ACTIVE },
    });
  }

  async createPasswordResetToken(
    userId: string,
    token: string,
    expiresAt: Date
  ): Promise<DomainPasswordResetToken> {
    const raw = await this.prisma.passwordResetToken.create({
      data: { userId, token, expiresAt },
      include: { user: true },
    });
    return {
      id: raw.id,
      userId: raw.userId,
      token: raw.token,
      expiresAt: raw.expiresAt,
      user: this.toUser(raw.user),
    };
  }

  async findPasswordResetToken(token: string): Promise<DomainPasswordResetToken | null> {
    const raw = await this.prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });
    if (!raw) return null;
    return {
      id: raw.id,
      userId: raw.userId,
      token: raw.token,
      expiresAt: raw.expiresAt,
      user: this.toUser(raw.user),
    };
  }

  async deletePasswordResetToken(token: string): Promise<void> {
    await this.prisma.passwordResetToken.delete({ where: { token } });
  }

  async updateUserPassword(userId: string, passwordHash: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
  }

  async findPatientProfileByUserId(userId: string): Promise<DomainPatientProfile | null> {
    const raw = await this.prisma.patientProfile.findUnique({ where: { id: userId } });
    if (!raw) return null;
    return {
      id: raw.id,
      patientId: raw.patientId,
      firstName: raw.firstName,
      lastName: raw.lastName,
      phone: raw.phone,
    };
  }

  async findDoctorProfileByUserId(userId: string): Promise<DomainDoctorProfile | null> {
    const raw = await this.prisma.doctorProfile.findUnique({ where: { id: userId } });
    if (!raw) return null;
    return {
      id: raw.id,
      firstName: raw.firstName,
      lastName: raw.lastName,
    };
  }

  async findUserById(userId: string): Promise<UserWithProfile | null> {
    const raw = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { 
        patientProfile: true,
        doctorProfile: {
          include: { specialization: true }
        }
      }
    });

    if (!raw) return null;

    let patientId = "";
    if (raw.role === Role.PATIENT) {
      if (!raw.patientProfile) {
        const generatedId = await this.patientIdGenerator.generate();
        const profile = await this.prisma.patientProfile.create({
          data: {
            id: raw.id,
            patientId: generatedId,
            firstName: "Patient",
            lastName: "User",
            phone: "",
          }
        });
        patientId = profile.patientId;
      } else {
        patientId = raw.patientProfile.patientId;
      }
    }

    if (raw.role === Role.DOCTOR && !raw.doctorProfile) {
      await this.prisma.doctorProfile.create({
        data: {
          id: raw.id,
          firstName: "Doctor",
          lastName: "User",
          licenseNumber: "TEMP-" + raw.id.slice(0, 8),
          consultationFee: 0,
          specializationId: (await this.prisma.specialization.findFirst())?.id || "",
        }
      });
    }

    return {
      user: this.toUser(raw),
      patientId
    };

  }

}
