import { AppointmentStatus } from "../value-objects/enums/AppointmentStatus";

// ─── Input DTOs ───────────────────────────────────────────────────────────
export interface CreateAppointmentDTO {
  patientId: string;
  doctorId: string;
  appointmentDate: Date;
  slotStart: string;
  slotEnd: string;
}

export interface DoctorScheduleDTO {
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
  slotCapacity: number;
}

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
    firstName: string;
    lastName: string;
    phone?: string | null;
  };
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
    firstName: string;
    lastName: string;
    phone?: string | null;
  };
}

export interface AppointmentWithFullDoctor extends AppointmentRecord {
  patient: {
    id: string;
    firstName: string;
    lastName: string;
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
  ): Promise<DoctorScheduleDTO | null>;

  getAppointmentsByDoctorAndDate(
    doctorId: string,
    date: Date
  ): Promise<{ slotStart: string; status: AppointmentStatus | string }[]>;

  createWithTransaction(data: CreateAppointmentDTO): Promise<AppointmentRecord>;

  getAppointmentsByPatientId(patientId: string): Promise<AppointmentWithConsultation[]>;
  findById(id: string): Promise<AppointmentWithDoctorAndPatient | null>;
  cancelAppointment(id: string, reason: string): Promise<AppointmentRecord>;
  getAppointmentsByDoctorId(doctorId: string): Promise<AppointmentWithPatient[]>;
  getAllAppointments(): Promise<AppointmentWithFullDoctor[]>;
  updateStatus(id: string, status: AppointmentStatus | string): Promise<AppointmentRecord>;
}
