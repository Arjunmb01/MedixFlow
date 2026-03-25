import { Appointment, AppointmentStatus, Prisma } from "@prisma/client";

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

// Typed return for patient appointments with full consultation data
export type AppointmentWithDoctor = Prisma.AppointmentGetPayload<{
  include: {
    doctor: { include: { specialization: true } };
  };
}>;

export type AppointmentWithConsultation = Prisma.AppointmentGetPayload<{
  include: {
    doctor: { include: { specialization: true } };
    consultation: {
      include: {
        medicalRecord: true;
        prescription: { include: { medicines: true } };
        vitals: true;
      };
    };
  };
}>;

export type AppointmentWithPatient = Prisma.AppointmentGetPayload<{
  include: { patient: true };
}>;

export type AppointmentWithDoctorAndPatient = Prisma.AppointmentGetPayload<{
  include: {
    doctor: { include: { specialization: true } };
    patient: true;
  };
}>;

export type AppointmentWithFullDoctor = Prisma.AppointmentGetPayload<{
  include: {
    patient: true;
    doctor: {
      select: {
        id: true;
        firstName: true;
        lastName: true;
        specialization: { select: { name: true } };
      };
    };
  };
}>;

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

  getAppointmentsByPatientId(patientId: string): Promise<AppointmentWithConsultation[]>;
  findById(id: string): Promise<AppointmentWithDoctorAndPatient | null>;
  cancelAppointment(id: string, reason: string): Promise<Appointment>;
  getAppointmentsByDoctorId(doctorId: string): Promise<AppointmentWithPatient[]>;
  getAllAppointments(): Promise<AppointmentWithFullDoctor[]>;
}