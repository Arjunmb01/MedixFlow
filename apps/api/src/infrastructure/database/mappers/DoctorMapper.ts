import { Doctor } from "../../../domain/entities/Doctor";
import { DoctorProfile as PrismaDoctorProfile, User as PrismaUser, Specialization as PrismaSpecialization, DoctorSchedule as PrismaDoctorSchedule, Appointment as PrismaAppointment, PatientProfile as PrismaPatientProfile, Prescription as PrismaPrescription, Medicine as PrismaMedicine } from "@prisma/client";
import { UserStatus as DomainUserStatus } from "../../../domain/value-objects/enums/UserStatus";
import { 
    DoctorProfile, 
    DoctorSchedule, 
    ConsultedPatientRecord, 
    PrescriptionRecord,
    AppointmentPreview
} from "../../../domain/value-objects/types/doctor.repository.types";
import { StaffDoctorListItem } from "../../../domain/value-objects/types/staff.repository.types";

export type PrismaDoctorWithUserAndSpec = PrismaDoctorProfile & { 
    user: PrismaUser; 
    specialization: PrismaSpecialization | null;
    schedules?: PrismaDoctorSchedule[];
};
export type PrismaStaffDoctor = PrismaDoctorWithUserAndSpec & { schedules: PrismaDoctorSchedule[] };
export type PrismaConsultedPatient = PrismaAppointment & { patient: PrismaPatientProfile };
export type PrismaAppointmentWithPatient = PrismaAppointment & { patient: PrismaPatientProfile };
export type PrismaPrescriptionFull = PrismaAppointment & { 
    patient: PrismaPatientProfile; 
    consultation: { 
        prescription: PrismaPrescription & { medicines: PrismaMedicine[] } 
    } | null 
};

export class DoctorMapper {
  toDomain(prismaDoctor: PrismaDoctorWithUserAndSpec | null | undefined): Doctor | null {
    if (!prismaDoctor) return null;

    const user = prismaDoctor.user;
    const specialization = prismaDoctor.specialization;

    return new Doctor(
      prismaDoctor.id,
      user.email,
      prismaDoctor.firstName,
      prismaDoctor.lastName,
      user.status as DomainUserStatus,
      specialization?.name || "General",
      prismaDoctor.consultationFee,
      prismaDoctor.licenseNumber,
      prismaDoctor.phone || "",
      prismaDoctor.bio || undefined,
      prismaDoctor.avatarUrl || undefined,
      user.passwordHash
    );
  }

  toProfile(prismaDoctor: PrismaDoctorWithUserAndSpec | null | undefined): DoctorProfile | null {
    if (!prismaDoctor) return null;

    return {
        id: prismaDoctor.id,
        firstName: prismaDoctor.firstName,
        lastName: prismaDoctor.lastName,
        email: prismaDoctor.user.email,
        phone: prismaDoctor.phone || undefined,
        licenseNumber: prismaDoctor.licenseNumber,
        specialty: prismaDoctor.specialization?.name || "General",
        consultationFee: prismaDoctor.consultationFee,
        status: prismaDoctor.user.status,
        bio: prismaDoctor.bio || undefined,
        avatarUrl: prismaDoctor.avatarUrl || undefined,
        address: (prismaDoctor as { address?: string }).address || undefined,
        schedules: prismaDoctor.schedules?.map((s) => this.toSchedule(s)) || [],
    };
  }

  toStaffDoctorListItem(prismaDoctor: PrismaStaffDoctor): StaffDoctorListItem {
    const specialization = prismaDoctor.specialization;
    const user = prismaDoctor.user;

    return {
      id: prismaDoctor.id,
      firstName: prismaDoctor.firstName,
      lastName: prismaDoctor.lastName,
      phone: prismaDoctor.phone || "",
      specialty: specialization?.name || "General",
      email: user.email,
      status: user.status as DomainUserStatus,
      user: {
        id: user.id,
        email: user.email,
        status: user.status as DomainUserStatus,
      },
      createdAt: user.createdAt,
      licenseNumber: prismaDoctor.licenseNumber,
      consultationFee: prismaDoctor.consultationFee,
      schedules: (prismaDoctor.schedules || []).map((s) => this.toSchedule(s))
    };
  }

  toSchedule(prismaSchedule: PrismaDoctorSchedule): DoctorSchedule {
    return {
        dayOfWeek: prismaSchedule.dayOfWeek,
        startTime: prismaSchedule.startTime,
        endTime: prismaSchedule.endTime,
        slotDurationMinutes: prismaSchedule.slotDurationMinutes,
        slotCapacity: prismaSchedule.slotCapacity,
        fullDay: prismaSchedule.fullDay,
        consultationType: prismaSchedule.consultationType as 'VIDEO' | 'CLINIC',
    };
  }

  toAppointmentPreview(apt: PrismaAppointmentWithPatient): AppointmentPreview {
    return {
        id: apt.id,
        patientId: apt.patientId,
        patient: {
            id: apt.patient.id,
            patientId: apt.patient.patientId,
            firstName: apt.patient.firstName,
            lastName: apt.patient.lastName,
            gender: apt.patient.gender
        },
        slotStart: apt.slotStart,
        slotEnd: apt.slotEnd,
        status: apt.status,
        appointmentDate: apt.appointmentDate
    };
  }

  toConsultedPatient(apt: PrismaConsultedPatient): ConsultedPatientRecord {
      return {
          id: apt.id,
          firstName: apt.patient.firstName,
          lastName: apt.patient.lastName,
          patientId: apt.patientId,
          lastConsultationDate: apt.appointmentDate,
      };
  }

  toPrescriptionRecord(apt: PrismaPrescriptionFull): PrescriptionRecord {
      const presc = apt.consultation?.prescription;
      return {
          id: presc?.id || "",
          patientName: `${apt.patient.firstName} ${apt.patient.lastName}`,
          date: apt.appointmentDate,
          medicines: presc?.medicines?.map((m) => ({
              name: m.name,
              dosage: m.dosage,
              frequency: m.frequency,
              duration: m.duration,
          })) || [],
          instructions: presc?.instructions || undefined,
      };
  }
}

