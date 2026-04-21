import { AppointmentStatus } from "../value-objects/enums/AppointmentStatus";

import { CreateAppointmentInput, DoctorAppointmentFilter, DoctorScheduleInput } from "../value-objects/types/appointment.types";

export interface AppointmentRecord {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentDate: Date;
  slotStart: string;
  slotEnd: string;
  status: AppointmentStatus | string;
  paymentStatus?: "PENDING" | "PAID" | "FAILED" | "REFUNDED" | string;
  paymentMethod?: "RAZORPAY" | "WALLET" | string;
  reason?: string | null;
  notes?: string | null;
  createdAt: Date;
  paymentAmount?: number;
  transactionId?: string;
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
    prescription?: {
      id: string;
      instructions?: string | null;
      medicines: Array<{
        id: string;
        name: string;
        dosage: string;
        frequency: string;
        duration: string;
      }>;
    } | null;
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
  findActiveBookingByPatient(patientId: string, date: Date, doctorId?: string, slotStart?: string): Promise<AppointmentRecord | null>;

  getAppointmentsByPatientId(patientId: string): Promise<AppointmentWithConsultation[]>;
  findById(id: string): Promise<AppointmentWithDoctorAndPatient | null>;
  cancelAppointment(id: string, reason: string): Promise<AppointmentRecord>;
  rescheduleAppointment(id: string, appointmentDate: Date, slotStart: string, slotEnd: string): Promise<AppointmentRecord>;
  getAppointmentsByDoctorId(doctorId: string, filter?: DoctorAppointmentFilter): Promise<{ appointments: AppointmentWithPatient[]; total: number }>;
  getAllAppointments(filter?: DoctorAppointmentFilter): Promise<{ appointments: AppointmentPreview[]; total: number }>;
  updateStatus(id: string, status: AppointmentStatus | string): Promise<AppointmentRecord>;
  updatePaymentStatus(id: string, status: string): Promise<void>;
  getUpcomingByDoctorId(doctorId : string): Promise<AppointmentWithPatient[]>;
  markPastAppointmentsAsNotAttended(): Promise<void>;
}
