import { AppointmentStatus } from "../value-objects/enums/AppointmentStatus";

import { CreateAppointmentInput, DoctorScheduleInput } from "../value-objects/types/appointment.types";

export interface AppointmentRecord {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentDate: Date;
  slotStart: string;
  slotEnd: string;
  status: AppointmentStatus | string;
  reason?: string | null;
  createdAt: Date;
}

export interface AppointmentWithDoctor extends AppointmentRecord {
  doctor: {
    id: string;
    firstName: string;
    lastName: string;
    specialization: { name: string } | null;
  };
}

export interface AppointmentWithConsultation extends AppointmentRecord {
  doctor: {
    id: string;
    firstName: string;
    lastName: string;
    specialization: { name: string } | null;
  };
  consultation: {
    id: string;
    status: string;
    vitals: {
      bloodPressure?: string | null;
      heartRate?: number | null;
      temperature?: number | null;
      weight?: number | null;
    }[];
    medicalRecord: {
      symptoms: string;
      diagnosis: string;
      notes?: string | null;
    } | null;
    prescription: {
      id: string;
      instructions?: string | null;
      medicines: Array<{
        name: string;
        dosage: string;
        frequency: string;
        duration: string;
      }>;
    } | null;
  } | null;
}

export interface AppointmentWithPatient extends AppointmentRecord {
  patient: {
    id: string;
    patientId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string | null;
  };
  consultation?: {
    id: string;
    status: string;
  } | null;
}


export interface AppointmentWithDoctorAndPatient extends AppointmentRecord {
  doctor: {
    id: string;
    firstName: string;
    lastName: string;
    specialization: { name: string } | null;
  };
  patient: {
    id: string;
    patientId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string | null;
  };
}


export interface AppointmentPreview extends AppointmentRecord {
  patient: {
    id: string;
    patientId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string | null;
  };
  doctor: {
    id: string;
    firstName: string;
    lastName: string;
    specialization: { name: string } | null;
  };
}


// ─── Repository contract ──────────────────────────────────────────────────
export interface IAppointmentRepository {
  getDoctorSchedule(
    doctorId: string,
    dayOfWeek: number
  ): Promise<DoctorScheduleInput | null>;

  getAppointmentsByDoctorAndDate(
    doctorId: string,
    date: Date
  ): Promise<{ slotStart: string; status: AppointmentStatus | string }[]>;

  createWithTransaction(data: CreateAppointmentInput): Promise<AppointmentRecord>;

  countActiveBookings(doctorId: string, date: Date, slotStart: string): Promise<number>;
  findActiveBookingByPatient(patientId: string, doctorId: string, date: Date, slotStart: string): Promise<AppointmentRecord | null>;

  getAppointmentsByPatientId(patientId: string): Promise<AppointmentWithConsultation[]>;
  findById(id: string): Promise<AppointmentWithDoctorAndPatient | null>;
  cancelAppointment(id: string, reason: string): Promise<AppointmentRecord>;
  getAppointmentsByDoctorId(doctorId: string): Promise<AppointmentWithPatient[]>;
  getAllAppointments(): Promise<AppointmentPreview[]>;
  updateStatus(id: string, status: AppointmentStatus | string): Promise<AppointmentRecord>;
  getUpcomingByDoctorId(doctorId : string): Promise<AppointmentWithPatient[]>;
}
