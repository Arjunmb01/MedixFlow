import { PrismaClient, Appointment, AppointmentStatus } from "@prisma/client";
import { IDateTimeService } from "@/domain/services/IDateTimeService";
import {
  IAppointmentRepository,
  AppointmentRecord,
  AppointmentWithConsultation,
  AppointmentWithDoctorAndPatient,
  AppointmentWithPatient,
  AppointmentPreview,
} from "../../domain/repositories/IAppointmentRepository";
import { CreateAppointmentInput, DoctorAppointmentFilter, DoctorScheduleInput } from "../../domain/value-objects/types/appointment.types";

import { AppointmentMapper, AppointmentStatusMapper } from "../database/mappers/AppointmentMapper";


export class AppointmentRepository implements IAppointmentRepository {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly mapper: AppointmentMapper,
    private readonly dateTimeService: IDateTimeService
  ) { }

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

  async findActiveBookingByPatient(patientId: string, date: Date, doctorId?: string, slotStart?: string): Promise<AppointmentRecord | null> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const orConditions: any[] = [];
    if (doctorId) orConditions.push({ doctorId });
    if (slotStart) orConditions.push({ slotStart });

    if (orConditions.length === 0) return null;

    const result = await this.prisma.appointment.findFirst({
      where: {
        patientId,
        appointmentDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
        OR: orConditions,
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
        patient: {
          include: { user: true },
        },
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

  async rescheduleAppointment(
    id: string,
    appointmentDate: Date,
    slotStart: string,
    slotEnd: string
  ): Promise<AppointmentRecord> {
    const result = await this.prisma.appointment.update({
      where: { id },
      data: {
        appointmentDate,
        slotStart,
        slotEnd,
        status: "PENDING",
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
        patient: {
          include: { user: true },
        },
        consultation: true,
      },
      orderBy: [
        { appointmentDate: "asc" },
        { slotStart: "asc" },
      ],
    });
    return results.map((r) => this.mapper.toWithPatient(r));
  }

  async getAppointmentsByDoctorId(doctorId: string, filter?: DoctorAppointmentFilter): Promise<{ appointments: AppointmentWithPatient[]; total: number }> {

    const where: any = {
      doctorId,
    };


    if (filter?.status) {
      const validStatuses: AppointmentStatus[] = [
        "PENDING",
        "CONFIRMED",
        "COMPLETED",
        "CANCELLED",
        "NOT_ATTENDED",
      ];

      const prismaStatus = AppointmentStatusMapper.toPrisma(filter.status);
      if (validStatuses.includes(prismaStatus)) {
        where.status = prismaStatus;
      }
    }


    if (filter?.fromDate || filter?.toDate) {
      where.appointmentDate = {};

      if (filter.fromDate) {
        where.appointmentDate.gte = filter.fromDate;
      }

      if (filter.toDate) {
        where.appointmentDate.lte = filter.toDate;
      }
    }


    if (filter?.isUpcoming !== undefined) {
      const now = this.dateTimeService.now();
      where.appointmentDate = {
        ...(where.appointmentDate || {}),
        ...(filter.isUpcoming
          ? { gte: now }
          : { lt: now }),
      };
    }

    const { page = 1, limit = 10 } = filter || {};
    const skip = (page - 1) * limit;

    const [appointments, total] = await Promise.all([
      this.prisma.appointment.findMany({
        where,
        include: {
          patient: {
            include: { user: true },
          },
          consultation: {
            include: {
              prescription: {
                include: {
                  medicines: true,
                },
              },
            },
          },
        },
        orderBy: {
          appointmentDate: "desc",
        },
        skip,
        take: limit,
      }),
      this.prisma.appointment.count({ where }),
    ]);

    return {
      appointments: appointments.map(r => this.mapper.toWithPatient(r)),
      total,
    };
  }

  async getAllAppointments(filter?: DoctorAppointmentFilter): Promise<{ appointments: AppointmentPreview[]; total: number }> {
    const where: any = {};

    if (filter?.status) {
      const validStatuses: AppointmentStatus[] = [
        "PENDING",
        "CONFIRMED",
        "COMPLETED",
        "CANCELLED",
        "NOT_ATTENDED",
      ];

      const prismaStatus = AppointmentStatusMapper.toPrisma(filter.status);
      if (validStatuses.includes(prismaStatus)) {
        where.status = prismaStatus;
      }
    }

    if (filter?.fromDate || filter?.toDate) {
      where.appointmentDate = {};
      if (filter.fromDate) where.appointmentDate.gte = filter.fromDate;
      if (filter.toDate) where.appointmentDate.lte = filter.toDate;
    }

    if (filter?.isUpcoming !== undefined) {
      const now = this.dateTimeService.now();
      where.appointmentDate = {
        ...(where.appointmentDate || {}),
        ...(filter.isUpcoming ? { gte: now } : { lt: now }),
      };
    }

    const { page = 1, limit = 10 } = filter || {};
    const skip = (page - 1) * limit;

    const [appointments, total] = await Promise.all([
      this.prisma.appointment.findMany({
        where,
        include: {
          patient: {
            include: { user: true },
          },
          doctor: {
            include: {
              specialization: true,
            },
          },
        },
        orderBy: {
          appointmentDate: "desc",
        },
        skip,
        take: limit,
      }),
      this.prisma.appointment.count({ where }),
    ]);

    return {
      appointments: appointments.map((r) => this.mapper.toPreview(r as any)),
      total,
    };
  }

  async updateStatus(id: string, status: AppointmentStatus | string): Promise<AppointmentRecord> {
    const result = await this.prisma.appointment.update({
      where: { id },
      data: {
        status: status as AppointmentStatus,
      },
    });
    return this.mapper.toRecord(result);
  }

  async markPastAppointmentsAsNotAttended(): Promise<void> {
    const now = this.dateTimeService.now();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    await this.prisma.appointment.updateMany({
      where: {
        appointmentDate: {
          lt: todayStart,
        },
        status: {
          in: ["PENDING", "CONFIRMED"],
        },
      },
      data: {
        status: AppointmentStatus.NOT_ATTENDED,
      },
    });

    const todaysUpcoming = await this.prisma.appointment.findMany({
      where: {
        appointmentDate: {
          gte: todayStart,
          lt: new Date(todayStart.getTime() + 24 * 60 * 60 * 1000),
        },
        status: {
          in: ["PENDING", "CONFIRMED"],
        },
      },
    });

    for (const appt of todaysUpcoming) {
      const slotEndTime = this.dateTimeService.toDateTime(appt.appointmentDate, appt.slotEnd);
      if (slotEndTime < now) {
        await this.prisma.appointment.update({
          where: { id: appt.id },
          data: {
            status: AppointmentStatus.NOT_ATTENDED,
          },
        });
      }
    }
  }
}



