import { PrismaClient, Appointment, AppointmentStatus } from "@prisma/client";
import {
  IAppointmentRepository,
  AppointmentRecord,
  AppointmentWithConsultation,
  AppointmentWithDoctorAndPatient,
  AppointmentWithPatient,
  AppointmentPreview,
} from "../../domain/repositories/IAppointmentRepository";
import { CreateAppointmentInput, DoctorScheduleInput } from "../../domain/value-objects/types/appointment.types";

import { AppointmentMapper } from "../database/mappers/AppointmentMapper";


export class AppointmentRepository implements IAppointmentRepository {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly mapper: AppointmentMapper
  ) {}

  async getDoctorSchedule(
    doctorId: string,
    dayOfWeek: number
  ): Promise<DoctorScheduleInput | null> {
    return this.prisma.doctorSchedule.findFirst({
      where: {
        doctorId,
        dayOfWeek,
      },
      select: {
        startTime: true,
        endTime: true,
        slotDurationMinutes: true,
        slotCapacity: true,
      },
    });
  }

  async getAppointmentsByDoctorAndDate(
    doctorId: string,
    date: Date
  ): Promise<{ slotStart: string; status: AppointmentStatus | string }[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const matches = await this.prisma.appointment.findMany({
      where: {
        doctorId,
        appointmentDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      select: {
        slotStart: true,
        status: true,
      },
    });

    return matches;
  }

  async createWithTransaction(
    data: CreateAppointmentInput
  ): Promise<AppointmentRecord> {
    const result = await this.prisma.appointment.create({
      data: {
        ...data,
        status: "PENDING",
      },
    });
    return this.mapper.toRecord(result);
  }

  async countActiveBookings(doctorId: string, date: Date, slotStart: string): Promise<number> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return this.prisma.appointment.count({
      where: {
        doctorId,
        appointmentDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
        slotStart,
        status: {
          not: "CANCELLED",
        },
      },
    });
  }

  async findActiveBookingByPatient(patientId: string, doctorId: string, date: Date, slotStart: string): Promise<AppointmentRecord | null> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const result = await this.prisma.appointment.findFirst({
      where: {
        patientId,
        doctorId,
        appointmentDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
        slotStart,
        status: {
          not: "CANCELLED",
        },
      },
    });

    return result ? this.mapper.toRecord(result) : null;
  }

  async getAppointmentsByPatientId(patientId: string): Promise<AppointmentWithConsultation[]> {
    const results = await this.prisma.appointment.findMany({
      where: { patientId },
      include: {
        doctor: {
          include: {
            specialization: true,
          },
        },
        consultation: {
          include: {
            medicalRecord: true,
            prescription: {
              include: {
                medicines: true,
              },
            },
            vitals: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return results.map(r => this.mapper.toWithConsultation(r));
  }

  async findById(id: string): Promise<AppointmentWithDoctorAndPatient | null> {
    const result = await this.prisma.appointment.findUnique({
      where: { id },
      include: {
        doctor: {
          include: {
            specialization: true,
          },
        },
        patient: true,
      },
    });
    return result ? this.mapper.toWithDoctorAndPatient(result) : null;
  }

  async cancelAppointment(id: string, reason: string): Promise<AppointmentRecord> {
    const result = await this.prisma.appointment.update({
      where: { id },
      data: {
        status: "CANCELLED",
        reason: reason,
      },
    });
    return this.mapper.toRecord(result);
  }

  async getUpcomingByDoctorId(doctorId: string): Promise<AppointmentWithPatient[]> {
    const results = await this.prisma.appointment.findMany({
      where: {
        doctorId,
        status: {
          in: ["PENDING", "CONFIRMED"],
        },
      },
      include: {
        patient: true,
      },
      orderBy: [
        { appointmentDate: "asc" },
        { slotStart: "asc" },
      ],
    });
    return results.map((r) => this.mapper.toWithPatient(r));
  }

  async getAppointmentsByDoctorId(doctorId: string): Promise<AppointmentWithPatient[]> {
    const results = await this.prisma.appointment.findMany({
      where: { doctorId,
        status : {
          in: ["PENDING", "CONFIRMED"]
        }
       },
      include: {
        patient: true,
      },
      orderBy : [
        {appointmentDate : "asc"},
        {slotStart : "asc"}
      ]
    });
    return results.map(r => this.mapper.toWithPatient(r));
  }

  async getAllAppointments(): Promise<AppointmentPreview[]> {
    const results = await this.prisma.appointment.findMany({
      include: {
        patient: true,
        doctor: {
          include: {
            specialization: true,
          },
        },
      },
      orderBy: {
        appointmentDate: "desc",
      },
    });
    return results.map(r => this.mapper.toPreview(r));
  }

  async updateStatus(id: string, status: AppointmentStatus | string): Promise<AppointmentRecord> {
    const result = await this.prisma.appointment.update({
      where: { id },
      data: { status: status as AppointmentStatus },
    });
    return this.mapper.toRecord(result);
  }
}