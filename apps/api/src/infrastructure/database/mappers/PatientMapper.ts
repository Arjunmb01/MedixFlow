import { Patient } from "../../../domain/entities/Patient";
import { PatientProfile as PrismaPatientProfile, User as PrismaUser, Role, EmergencyContact as PrismaEmergencyContact } from "@prisma/client";
import { UserStatus } from "../../../domain/value-objects/enums/UserStatus";
import { Gender } from "../../../domain/value-objects/enums/Gender";
import { PatientProfile as DomainPatientProfile, PatientListItem } from "../../../domain/value-objects/types/patient.repository.types";

export type PrismaPatientWithUser = PrismaPatientProfile & { user: PrismaUser, emergencyContacts?: PrismaEmergencyContact[] };

export class PatientMapper {
  toDomain(prismaPatient: PrismaPatientWithUser | null | undefined): Patient | null {
    if (!prismaPatient) return null;
    
    const user = prismaPatient.user;
    
    const statusMap: Record<string, UserStatus> = {
      ACTIVE: UserStatus.ACTIVE,
      INACTIVE: UserStatus.INACTIVE,
      SUSPENDED: UserStatus.SUSPENDED
    };
    const status = statusMap[user.status] || UserStatus.INACTIVE;

    return new Patient(
      prismaPatient.id,
      prismaPatient.patientId,
      user.email,
      prismaPatient.firstName,
      prismaPatient.lastName,
      status,
      prismaPatient.phone,
      prismaPatient.bloodGroup || undefined,
      prismaPatient.gender as Gender,
      user.passwordHash,
      user.role,
      prismaPatient.emergencyContacts || []
    );
  }


  toProfile(prismaPatient: PrismaPatientWithUser | null | undefined): DomainPatientProfile | null {
    if (!prismaPatient) return null;
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
      status: { ACTIVE: UserStatus.ACTIVE, INACTIVE: UserStatus.INACTIVE, SUSPENDED: UserStatus.SUSPENDED }[user.status] || UserStatus.INACTIVE,
      user: {
        id: user.id,
        email: user.email,
        status: { ACTIVE: UserStatus.ACTIVE, INACTIVE: UserStatus.INACTIVE, SUSPENDED: UserStatus.SUSPENDED }[user.status] || UserStatus.INACTIVE,
        createdAt: user.createdAt
      },
      createdAt: user.createdAt,
      emergencyContacts: prismaPatient.emergencyContacts || []
    };
  }

  toListItem(prismaPatient: PrismaPatientWithUser & { _count?: { appointments: number } }): PatientListItem | null {
    const domain = this.toProfile(prismaPatient);
    if (!domain) return null;
    return {
      ...domain,
      appointmentsCount: prismaPatient._count?.appointments || 0
    };
  }
}

