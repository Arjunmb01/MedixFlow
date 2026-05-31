import { AppointmentStatus } from "../value-objects/enums/AppointmentStatus";
import { PaginatedResponse } from "../value-objects/types/pagination.types";
export { PaginatedResponse };

import { CreateAppointmentInput, DoctorAppointmentFilter, DoctorScheduleInput, PatientDashboardSummary } from "../value-objects/types/appointment.types";

export interface AppointmentRecord {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentDate: Date;
  slotStart: string;
  slotEnd: string;
  startTime?: Date | null;
  endTime?: Date | null;
  status: AppointmentStatus | string;
  paymentStatus?: "PENDING" | "PAID" | "FAILED" | "REFUNDED" | string;
  paymentMethod?: "RAZORPAY" | "WALLET" | string;
  reason?: string | null;
  notes?: string | null;
  createdAt: Date;
  paymentAmount?: number;
  transactionId?: string;
  queueNumber?: number | null;
  consultationType?: "VIDEO" | "CLINIC";
  rescheduledToId?: string | null;
  lastStatusChangedAt?: Date;
  parentAppointmentId?: string | null;
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
      planForManagement?: string | null;
    } | null;
    prescription: {
      id: string;
      instructions?: string | null;
      medicines: Array<{
        id?: string;
        name: string;
        dosage: string;
        frequency: string;
        duration: string;
        instructions?: string | null;
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
        instructions?: string | null;
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
  payment?: {
    id: string;
    amount: number;
    status: string;
    paymentMethod: string;
    transactionId?: string;
  };
<<<<<<< HEAD
=======
  consultation?: {
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
      planForManagement?: string | null;
    } | null;
    prescription: {
      id: string;
      instructions?: string | null;
      medicines: Array<{
        id?: string;
        name: string;
        dosage: string;
        frequency: string;
        duration: string;
        instructions?: string | null;
      }>;
    } | null;
  } | null;
>>>>>>> 141ec674faa5e8dec8f62adfdfa63bd47aaf7909
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

export interface AppointmentAuditLogInput {
  appointmentId: string;
  action: string;
  actorId: string;
  actorRole: string;
  oldStatus?: AppointmentStatus | string;
  newStatus?: AppointmentStatus | string;
  details?: Record<string, unknown>;
}

export interface RescheduleProposalInput {
  appointmentId: string;
  proposedById: string;
  proposedByRole: string;
  newDate: Date;
  newSlotStart: string;
  newSlotEnd: string;
  reason?: string;
  expiresAt?: Date;
}

export interface ReassignInput {
  appointmentId: string;
  newDoctorId: string;
  reassignedBy: string;
  reason?: string;
  newDate?: Date;
  newSlotStart?: string;
  newSlotEnd?: string;
}

export interface RescheduleProposal {
  id: string;
  appointmentId: string;
  proposedById: string;
  proposedByRole: string;
  newDate: Date;
  newSlotStart: string;
  newSlotEnd: string;
  status: string;
  reason?: string | null;
  expiresAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Repository contract ──────────────────────────────────────────────────
export interface IAppointmentRepository {
  createAuditLog(log: AppointmentAuditLogInput): Promise<void>;
  createRescheduleProposal(proposal: RescheduleProposalInput): Promise<RescheduleProposal>;
  getProposalsByAppointmentId(appointmentId: string): Promise<RescheduleProposal[]>;
  findProposalById(id: string): Promise<RescheduleProposal | null>;
  updateProposalStatus(id: string, status: string): Promise<void>;
  findImpactedAppointments(doctorId: string, startDate: Date, endDate: Date): Promise<string[]>;
  reassignAtomic(data: ReassignInput): Promise<AppointmentRecord>;
  
  getDoctorSchedule(
    doctorId: string,
    dayOfWeek: number
  ): Promise<DoctorScheduleInput | null>;

  getAppointmentsByDoctorAndDate(
    doctorId: string,
    date: Date
  ): Promise<{ slotStart: string; status: AppointmentStatus | string }[]>;

  getAppointmentsForSlotGeneration(
    doctorId: string,
    date: Date
  ): Promise<{ startTime: Date | null; endTime: Date | null; status: AppointmentStatus | string }[]>;

  bookAtomic(data: {
    doctorId: string;
    patientId: string;
    startTime: Date;
    endTime: Date;
    reason?: string;
  }): Promise<AppointmentRecord>;

  createWithTransaction(data: CreateAppointmentInput): Promise<AppointmentRecord>;

  countActiveBookings(doctorId: string, date: Date, slotStart: string): Promise<number>;
  findActiveBookingByPatient(patientId: string, date: Date, doctorId?: string, slotStart?: string): Promise<AppointmentRecord | null>;

  getAppointmentsByPatientId(patientId: string, filter?: DoctorAppointmentFilter): Promise<PaginatedResponse<AppointmentWithConsultation>>;
<<<<<<< HEAD
  getPatientDashboardSummary(patientId: string): Promise<PatientDashboardSummary>;
=======
>>>>>>> 141ec674faa5e8dec8f62adfdfa63bd47aaf7909
  findById(id: string): Promise<AppointmentWithDoctorAndPatient | null>;
  cancelAppointment(id: string, reason: string): Promise<AppointmentRecord>;
  rescheduleAppointment(id: string, appointmentDate: Date, slotStart: string, slotEnd: string): Promise<AppointmentRecord>;
  getAppointmentsByDoctorId(doctorId: string, filter?: DoctorAppointmentFilter): Promise<PaginatedResponse<AppointmentWithPatient>>;
  getAllAppointments(filter?: DoctorAppointmentFilter): Promise<PaginatedResponse<AppointmentPreview>>;
  updateStatus(id: string, status: AppointmentStatus | string): Promise<AppointmentRecord>;
  updatePaymentStatus(id: string, status: string): Promise<void>;
  getUpcomingByDoctorId(doctorId : string): Promise<AppointmentWithPatient[]>;
  markPastAppointmentsAsNotAttended(userId?: string): Promise<void>;
  updateQueuePosition(appointmentId: string, queueNumber: number): Promise<void>;
  getTodaysQueue(doctorId: string): Promise<AppointmentWithPatient[]>;
  findExpiredPending(now: Date): Promise<AppointmentRecord[]>;
  checkConflict(data: {
    patientId: string;
    doctorId: string;
    appointmentDate: Date;
    startTime: Date;
    endTime: Date;
    excludeAppointmentId?: string;
  }): Promise<{ hasConflict: boolean; type: 'PATIENT_OVERLAP' | 'DOCTOR_FULL' | 'NONE'; message: string }>;

  rescheduleAtomic(data: {
    appointmentId: string;
    newDate: Date;
    slotStart: string;
    slotEnd: string;
    startTime: Date;
    endTime: Date;
  }): Promise<AppointmentRecord>;

  cancelMany(ids: string[]): Promise<void>;
}
