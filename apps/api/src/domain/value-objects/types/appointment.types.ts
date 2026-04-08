export interface CreateAppointmentInput {
  patientId: string;
  doctorId: string;
  appointmentDate: Date;
  slotStart: string;
  slotEnd: string;
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
  status?: AppointmentStatus;
  fromDate?: Date;
  toDate?: Date;
  isUpcoming?: boolean;
  page?: number;
  limit?: number;
}