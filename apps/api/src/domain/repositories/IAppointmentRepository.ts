import { Appointment, AppointmentStatus } from "@prisma/client";

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

export interface IAppointmentRepository {
  getDoctorSchedule(
    doctorId: string,
    dayOfWeek: number
  ): Promise<DoctorScheduleDTO | null>;

  getAppointmentsByDoctorAndDate(
    doctorId: string,
    date: Date
  ): Promise<{ slotStart: string; status: AppointmentStatus }[]>;

  createWithTransaction(
    data: CreateAppointmentDTO
  ): Promise<Appointment>;

  getAppointmentsByPatientId(patientId: string): Promise<any[]>;
  findById(id: string): Promise<any | null>;
  cancelAppointment(id: string, reason: string): Promise<Appointment>;
  getAppointmentsByDoctorId(doctorId: string): Promise<any[]>;
  getAllAppointments(): Promise<any[]>;
}