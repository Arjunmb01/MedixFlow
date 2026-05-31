import { PaymentMethod } from "../enums/PaymentMethod";
import { PaginationQuery } from "./pagination.types";

export interface CreateAppointmentInput {
  patientId: string;
  doctorId: string;
  appointmentDate: Date;
  slotStart: string;
  slotEnd: string;
  consultationType?: "VIDEO" | "CLINIC";
  startTime?: Date;
  endTime?: Date;
  paymentMethod?: PaymentMethod;
  paymentStatus?: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  paymentAmount?: number;
  status?: AppointmentStatus | string;
  useWallet?: boolean;
  reason?: string;
  expiresAt?: Date;
}

export interface DoctorScheduleInput {
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
  slotCapacity: number;
  consultationType?: "VIDEO" | "CLINIC";
}


export interface AppointmentDateTime {
  appointmentDate: Date;
  slotStart : string
}

import { AppointmentStatus } from "../enums/AppointmentStatus";

export interface DoctorAppointmentFilter extends PaginationQuery {
  status?: AppointmentStatus | string;
  paymentStatus?: string;
  doctorId?: string;
  fromDate?: Date;
  toDate?: Date;
  isUpcoming?: boolean;
  /** When true, loads consultation, prescription, vitals (heavier query). */
  includeConsultationDetails?: boolean;
}

export interface PatientDashboardSummary {
  upcomingCount: number;
  nextAppointment: {
    id: string;
    date: Date;
    slotStart: string;
    doctorName: string;
    specialty: string;
    consultationType?: "VIDEO" | "CLINIC";
  } | null;
  recentAppointments: Array<{
    id: string;
    doctorName: string;
    specialty: string;
    date: Date;
    status: string;
  }>;
}
