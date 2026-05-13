import { PaymentMethod } from "../enums/PaymentMethod";
import { PaginationQuery } from "./pagination.types";

export interface CreateAppointmentInput {
  patientId: string;
  doctorId: string;
  appointmentDate: Date;
  slotStart: string;
  slotEnd: string;
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
}
