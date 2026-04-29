import { PaymentMethod } from "../enums/PaymentMethod";

export interface CreateAppointmentInput {
  patientId: string;
  doctorId: string;
  appointmentDate: Date;
  slotStart: string;
  slotEnd: string;
  startTime?: Date;
  endTime?: Date;
  paymentMethod?: PaymentMethod;
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

export type DoctorAppointmentFilter = {
  status?: AppointmentStatus | string;
  paymentStatus?: string;
  doctorId?: string;
  fromDate?: Date;
  toDate?: Date;
  isUpcoming?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
}
