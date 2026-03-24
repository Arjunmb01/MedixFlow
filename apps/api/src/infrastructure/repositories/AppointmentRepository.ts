import { PrismaClient, Appointment, AppointmentStatus } from "@prisma/client";
import {
  IAppointmentRepository,
  CreateAppointmentDTO,
  DoctorScheduleDTO,
} from "../../domain/repositories/IAppointmentRepository";

export class AppointmentRepository implements IAppointmentRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async getDoctorSchedule(
    doctorId: string,
    dayOfWeek: number
  ): Promise<DoctorScheduleDTO | null> {
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
  ): Promise<{ slotStart: string; status: AppointmentStatus }[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return this.prisma.appointment.findMany({
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
  }

  async createWithTransaction(
    data: CreateAppointmentDTO
  ): Promise<Appointment> {
    return this.prisma.$transaction(async (tx) => {
      const schedule = await tx.doctorSchedule.findFirst({
        where: {
          doctorId: data.doctorId,
          dayOfWeek: data.appointmentDate.getDay(),
        },
        select: { slotCapacity: true },
      });

      const capacity = schedule?.slotCapacity ?? 5;

      const startOfDay = new Date(data.appointmentDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(data.appointmentDate);
      endOfDay.setHours(23, 59, 59, 999);

      const activeBookings = await tx.appointment.count({
        where: {
          doctorId: data.doctorId,
          appointmentDate: {
            gte: startOfDay,
            lte: endOfDay,
          },
          slotStart: data.slotStart,
          status: {
            not: "CANCELLED",
          },
        },
      });

      if (activeBookings >= capacity) {
        throw new Error(`Slot is full (capacity: ${capacity} patients)`);
      }

      const existingPatientBooking = await tx.appointment.findFirst({
        where: {
          patientId: data.patientId,
          doctorId: data.doctorId,
          appointmentDate: {
            gte: startOfDay,
            lte: endOfDay,
          },
          slotStart: data.slotStart,
          status: {
            not: "CANCELLED",
          },
        },
      });

      if (existingPatientBooking) {
        throw new Error("You already have an active appointment with this doctor at this time.");
      }

      return tx.appointment.create({
        data: {
          ...data,
          status: "PENDING",
        },
      });
    });
  }

  async getAppointmentsByPatientId(patientId: string): Promise<any[]> {
    return this.prisma.appointment.findMany({
      where: { patientId },
      include: {
        doctor: {
          include: {
            specialization: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findById(id: string): Promise<any | null> {
    return this.prisma.appointment.findUnique({
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
  }

  async cancelAppointment(id: string, reason: string): Promise<Appointment> {
    return this.prisma.appointment.update({
      where: { id },
      data: {
        status: "CANCELLED",
        reason: reason,
      },
    });
  }

  async getAppointmentsByDoctorId(doctorId: string): Promise<any[]> {
    return this.prisma.appointment.findMany({
      where: { doctorId },
      include: {
        patient: true,
      },
    });
  }

  async getAllAppointments(): Promise<any[]> {
    return this.prisma.appointment.findMany({
      include: {
        patient: true,
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            specialization: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        appointmentDate: "desc",
      },
    });
  }
}