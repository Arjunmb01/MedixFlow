import { Patient } from "../../../domain/entities/Patient";
import { PatientProfile as PrismaPatientProfile, User as PrismaUser, Role } from "@prisma/client";
import { UserStatus } from "../../../domain/value-objects/enums/UserStatus";
import { Gender } from "../../../domain/value-objects/enums/Gender";
import { PatientProfile as DomainPatientProfile } from "../../../domain/value-objects/types/patient.repository.types";

type PrismaPatientWithUser = PrismaPatientProfile & { user: PrismaUser, emergencyContacts?: any[] };

export class PatientMapper {
  toDomain(prismaPatient: PrismaPatientWithUser): Patient {
    if (!prismaPatient) return null as unknown as Patient;
    
    const user = prismaPatient.user;
    
    return new Patient(
      prismaPatient.id,
      user.email,
      prismaPatient.firstName,
      prismaPatient.lastName,
      user.status as UserStatus,
      prismaPatient.phone,
      prismaPatient.bloodGroup || undefined,
      prismaPatient.gender as Gender,
      user.passwordHash,
      user.role,
      prismaPatient.emergencyContacts || []
    );
  }

  toProfile(prismaPatient: PrismaPatientWithUser): DomainPatientProfile {
    const user = prismaPatient.user;
    return {
      id: prismaPatient.id,
      firstName: prismaPatient.firstName,
      lastName: prismaPatient.lastName,
      email: user.email,
      phone: prismaPatient.phone || "",
      dob: prismaPatient.dob || undefined,
      gender: prismaPatient.gender as Gender,
      bloodGroup: prismaPatient.bloodGroup || undefined,
      patientId: prismaPatient.patientId,
      avatarUrl: prismaPatient.avatarUrl || undefined,
      status: user.status,
      user: {
        id: user.id,
        email: user.email,
        status: user.status,
        createdAt: user.createdAt
      },
      createdAt: user.createdAt,
      emergencyContacts: prismaPatient.emergencyContacts || []
    };
  }

  toListItem(prismaPatient: PrismaPatientWithUser & { _count?: { appointments: number } }): any {
    const domain = this.toDomain(prismaPatient);
    return {
      ...domain,
      user: {
        id: prismaPatient.user.id,
        email: prismaPatient.user.email,
        status: prismaPatient.user.status,
        createdAt: prismaPatient.user.createdAt
      },
      appointmentsCount: prismaPatient._count?.appointments || 0
    };
  }
}

