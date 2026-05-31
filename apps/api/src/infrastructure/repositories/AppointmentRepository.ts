import { PrismaClient, Appointment, AppointmentStatus, Prisma, Role, PaymentStatus } from "@prisma/client";
import { IDateTimeService } from "@/domain/services/IDateTimeService";
import {
  IAppointmentRepository,
  PaginatedResponse,
  AppointmentRecord,
  AppointmentWithConsultation,
  AppointmentWithDoctorAndPatient,
  AppointmentWithPatient,
  AppointmentPreview,
  AppointmentAuditLogInput,
  RescheduleProposalInput,
  ReassignInput
} from "../../domain/repositories/IAppointmentRepository";
import { CreateAppointmentInput, DoctorAppointmentFilter, DoctorScheduleInput } from "../../domain/value-objects/types/appointment.types";

import { AppointmentMapper, AppointmentStatusMapper } from "../database/mappers/AppointmentMapper";

const DEFAULT_PAGE_LIMIT = 50;
const MAX_PAGE_LIMIT = 100;

const doctorListInclude = {
  doctor: {
    include: {
      specialization: true,
    },
  },
} as const;

const fullConsultationInclude = {
  ...doctorListInclude,
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
} as const;

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
        consultationType: true,
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

  async getAppointmentsForSlotGeneration(
    doctorId: string,
    date: Date
  ): Promise<{ startTime: Date | null; endTime: Date | null; status: AppointmentStatus | string }[]> {
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
        status: {
          not: "CANCELLED",
        },
      },
      select: {
        startTime: true,
        endTime: true,
        status: true,
      },
    });
  }

  async createWithTransaction(
    data: CreateAppointmentInput
  ): Promise<AppointmentRecord> {
    const { useWallet, ...appointmentData } = data;
    const startTime = data.startTime || this.dateTimeService.toDateTime(data.appointmentDate, data.slotStart);
    const endTime = data.endTime || this.dateTimeService.toDateTime(data.appointmentDate, data.slotEnd);

    const result = await this.prisma.appointment.create({
      data: {
        ...appointmentData,
        startTime,
        endTime,
        status: (data.status as AppointmentStatus) || "PENDING",
      },
    });
    return this.mapper.toRecord(result);
  }

  async bookAtomic(data: {
    doctorId: string;
    patientId: string;
    startTime: Date;
    endTime: Date;
    reason?: string;
  }): Promise<AppointmentRecord> {
    const { doctorId, patientId, startTime, endTime, reason } = data;

    return await this.prisma.$transaction(async (tx) => {
<<<<<<< HEAD
      await tx.$executeRawUnsafe(`SELECT id FROM "DoctorProfile" WHERE id = '${doctorId}' FOR UPDATE`);
=======
      // FIX [SECURITY]: Using parameterized query to prevent SQL Injection
      // FIX [RACE CONDITION]: Locking both Doctor and Patient to prevent overlapping appointments
      await tx.$executeRaw`SELECT id FROM "DoctorProfile" WHERE id = ${doctorId} FOR UPDATE`;
      await tx.$executeRaw`SELECT id FROM "PatientProfile" WHERE id = ${patientId} FOR UPDATE`;
>>>>>>> 141ec674faa5e8dec8f62adfdfa63bd47aaf7909

      const overlapping = await tx.appointment.findFirst({
        where: {
          doctorId,
          status: { in: ["PENDING", "BOOKED"] },
          OR: [
            {
              startTime: { lt: endTime },
              endTime: { gt: startTime }
            }
          ]
        }
      });

      if (overlapping) {
        throw new Error("SLOT_ALREADY_BOOKED");
      }

      const result = await tx.appointment.create({
        data: {
          doctorId,
          patientId,
          appointmentDate: startTime,
          startTime,
          endTime,
          slotStart: startTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }),
          slotEnd: endTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }),
          status: "PENDING",
          reason
        }
      });

      return this.mapper.toRecord(result);
    });
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

    const orConditions: Prisma.AppointmentWhereInput[] = [];
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
          in: ["BOOKED", "PENDING"] as AppointmentStatus[],
        },
      },
    });

    return result ? this.mapper.toRecord(result) : null;
  }

  async getAppointmentsByPatientId(patientId: string, filter?: DoctorAppointmentFilter): Promise<PaginatedResponse<AppointmentWithConsultation>> {
    const where: Prisma.AppointmentWhereInput = { patientId };
    
    if (filter?.search) {
      where.OR = [
        { doctor: { firstName: { contains: filter.search, mode: 'insensitive' } } },
        { doctor: { lastName: { contains: filter.search, mode: 'insensitive' } } },
        { doctor: { specialization: { name: { contains: filter.search, mode: 'insensitive' } } } },
      ];
    }
    
    if (filter?.status) where.status = filter.status as AppointmentStatus;
    if (filter?.paymentStatus) where.paymentStatus = filter.paymentStatus as PaymentStatus;
    
    if (filter?.isUpcoming) {
      const today = new Date();
      today.setHours(0,0,0,0);
      where.appointmentDate = { gte: today };
      where.status = { in: ['PENDING', 'BOOKED'] };
    } else if (filter?.fromDate || filter?.toDate) {
      where.appointmentDate = {};
      if (filter.fromDate) where.appointmentDate.gte = filter.fromDate;
      if (filter.toDate) where.appointmentDate.lte = filter.toDate;
    }

    const { page = 1, sortBy = "appointmentDate", sortOrder = "desc" } = filter || {};
    const limit = Math.min(filter?.limit ?? DEFAULT_PAGE_LIMIT, MAX_PAGE_LIMIT);
    const skip = (page - 1) * limit;
    const include = filter?.includeConsultationDetails
      ? fullConsultationInclude
      : doctorListInclude;

    const [results, total] = await Promise.all([
      this.prisma.appointment.findMany({
        where,
        include,
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip,
        take: limit,
      }),
      this.prisma.appointment.count({ where }),
    ]);

    return {
<<<<<<< HEAD
      data: results.map((r) =>
        this.mapper.toWithConsultation({
          ...r,
          consultation: "consultation" in r ? r.consultation : null,
        } as Parameters<AppointmentMapper["toWithConsultation"]>[0])
      ),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      }
    };
  }

  async getPatientDashboardSummary(patientId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingWhere = {
      patientId,
      status: { in: ["PENDING", "BOOKED"] as AppointmentStatus[] },
      appointmentDate: { gte: today },
    };

    const [upcomingCount, next, recent] = await Promise.all([
      this.prisma.appointment.count({ where: upcomingWhere }),
      this.prisma.appointment.findFirst({
        where: upcomingWhere,
        orderBy: [{ appointmentDate: "asc" }, { slotStart: "asc" }],
        include: doctorListInclude,
      }),
      this.prisma.appointment.findMany({
        where: { patientId },
        orderBy: { appointmentDate: "desc" },
        take: 5,
        include: doctorListInclude,
      }),
    ]);

    return {
      upcomingCount,
      nextAppointment: next
        ? {
            id: next.id,
            date: next.appointmentDate,
            slotStart: next.slotStart,
            doctorName: `Dr. ${next.doctor.firstName} ${next.doctor.lastName}`,
            specialty: next.doctor.specialization?.name ?? "General",
            consultationType: next.consultationType as "VIDEO" | "CLINIC",
          }
        : null,
      recentAppointments: recent.map((app) => ({
        id: app.id,
        doctorName: `Dr. ${app.doctor.firstName} ${app.doctor.lastName}`,
        specialty: app.doctor.specialization?.name ?? "General",
        date: app.appointmentDate,
        status: app.status,
      })),
=======
      data: results.map(r => this.mapper.toWithConsultation(r)),
      meta: {
        total,
        page: page || 1,
        limit: limit || 10,
        totalPages: Math.ceil(total / (limit || 10))
      }
>>>>>>> 141ec674faa5e8dec8f62adfdfa63bd47aaf7909
    };
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
        payment: true,
        consultation: {
          include: {
            vitals: true,
            medicalRecord: true,
            prescription: {
              include: { medicines: true }
            }
          }
        }
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
    const now = this.dateTimeService.now();
    const results = await this.prisma.appointment.findMany({
      where: {
        doctorId,
        appointmentDate: { gte: now },
        status: {
          in: ["BOOKED", "PENDING"],
        },
      },
      include: {
        patient: {
          include: { user: true },
        },
        consultation: {
          include: {
            prescription: {
              include: { medicines: true }
            }
          }
        },
      },
      orderBy: [
        { appointmentDate: "asc" },
        { slotStart: "asc" },
      ],
    });
    return results.map((r) => this.mapper.toWithPatient(r));
  }

  async getTodaysQueue(doctorId: string): Promise<AppointmentWithPatient[]> {
    const now = this.dateTimeService.now();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    const results = await this.prisma.appointment.findMany({
      where: {
        doctorId,
        appointmentDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          in: ["BOOKED", "PENDING"],
        },
      },
      include: {
        patient: {
          include: { user: true },
        },
        consultation: {
          include: {
            prescription: {
              include: { medicines: true }
            }
          }
        },
      },
      orderBy: {
        queueNumber: "asc",
      },
    });

    return results.map(r => this.mapper.toWithPatient(r));
  }

  async updateQueuePosition(appointmentId: string, queueNumber: number): Promise<void> {
    await this.prisma.appointment.update({
      where: { id: appointmentId },
      data: { queueNumber },
    });
  }

  async getAppointmentsByDoctorId(doctorId: string, filter?: DoctorAppointmentFilter): Promise<PaginatedResponse<AppointmentWithPatient>> {
    const where: Prisma.AppointmentWhereInput = { doctorId };

    if (filter?.search) {
      where.OR = [
        { patient: { firstName: { contains: filter.search, mode: 'insensitive' } } },
        { patient: { lastName: { contains: filter.search, mode: 'insensitive' } } },
        { patient: { patientId: { contains: filter.search, mode: 'insensitive' } } },
      ];
    }

    if (filter?.status) {
      where.status = filter.status as AppointmentStatus;
    }

    if (filter?.paymentStatus) {
      where.paymentStatus = filter.paymentStatus as PaymentStatus;
    }

    if (filter?.fromDate || filter?.toDate) {
      where.appointmentDate = {};
      if (filter.fromDate) where.appointmentDate.gte = filter.fromDate;
      if (filter.toDate) where.appointmentDate.lte = filter.toDate;
    }

    if (filter?.isUpcoming !== undefined) {
      const now = this.dateTimeService.now();
      where.appointmentDate = {
<<<<<<< HEAD
        ...(where.appointmentDate as any || {}),
=======
        ...(where.appointmentDate as Prisma.DateTimeFilter || {}),
>>>>>>> 141ec674faa5e8dec8f62adfdfa63bd47aaf7909
        ...(filter.isUpcoming ? { gte: now } : { lt: now }),
      };
    }

    const { page = 1, limit = 10, sortBy = "appointmentDate", sortOrder = "desc" } = filter || {};
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
              vitals: true,
              medicalRecord: true,
              prescription: {
                include: {
                  medicines: true,
                },
              },
            },
          },
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip,
        take: limit,
      }),
      this.prisma.appointment.count({ where }),
    ]);

    return {
      data: appointments.map(r => this.mapper.toWithPatient(r)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getAllAppointments(filter?: DoctorAppointmentFilter): Promise<PaginatedResponse<AppointmentPreview>> {
    const where: Prisma.AppointmentWhereInput = {};

    if (filter?.search) {
      where.OR = [
        { patient: { firstName: { contains: filter.search, mode: 'insensitive' } } },
        { patient: { lastName: { contains: filter.search, mode: 'insensitive' } } },
        { patient: { patientId: { contains: filter.search, mode: 'insensitive' } } },
        { doctor: { firstName: { contains: filter.search, mode: 'insensitive' } } },
        { doctor: { lastName: { contains: filter.search, mode: 'insensitive' } } },
        { id: { contains: filter.search, mode: 'insensitive' } },
      ];
    }

    if (filter?.doctorId) where.doctorId = filter.doctorId;
    if (filter?.status) where.status = filter.status as AppointmentStatus;
    if (filter?.paymentStatus) where.paymentStatus = filter.paymentStatus as PaymentStatus;

    if (filter?.fromDate || filter?.toDate) {
      where.appointmentDate = {};
      if (filter.fromDate) where.appointmentDate.gte = filter.fromDate;
      if (filter.toDate) where.appointmentDate.lte = filter.toDate;
    }

    const { page = 1, limit = 10, sortBy = "appointmentDate", sortOrder = "desc" } = filter || {};
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
          payment: true,
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip,
        take: limit,
      }),
      this.prisma.appointment.count({ where }),
    ]);

    return {
<<<<<<< HEAD
      data: appointments.map((r) => this.mapper.toPreview(r as any)),
=======
      data: appointments.map((r) => this.mapper.toPreview(r)),
>>>>>>> 141ec674faa5e8dec8f62adfdfa63bd47aaf7909
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
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

  async updatePaymentStatus(id: string, status: string): Promise<void> {
    await this.prisma.appointment.update({
      where: { id },
      data: {
        paymentStatus: status as PaymentStatus,
      },
    });
  }

  async markPastAppointmentsAsNotAttended(userId?: string): Promise<void> {
    const now = this.dateTimeService.now();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const baseWhere: Prisma.AppointmentWhereInput = {
      appointmentDate: { lt: todayStart },
      status: { in: ["PENDING", "BOOKED"] },
    };

    if (userId) {
      baseWhere.OR = [
        { patientId: userId },
        { doctorId: userId }
      ];
    }

    // 1. Mark strictly past days
    await this.prisma.appointment.updateMany({
      where: baseWhere,
      data: { status: AppointmentStatus.NO_SHOW },
    });

    // 2. Mark today's expired slots (scoped to user if provided)
    const todayWhere: Prisma.AppointmentWhereInput = {
      appointmentDate: {
        gte: todayStart,
        lt: new Date(todayStart.getTime() + 24 * 60 * 60 * 1000),
      },
      status: { in: ["PENDING", "BOOKED"] },
    };

    if (userId) {
      todayWhere.OR = [
        { patientId: userId },
        { doctorId: userId }
      ];
    }

    const todaysUpcoming = await this.prisma.appointment.findMany({
      where: todayWhere,
      select: { id: true, appointmentDate: true, slotEnd: true }
    });

    for (const appt of todaysUpcoming) {
      const slotEndTime = this.dateTimeService.toDateTime(appt.appointmentDate, appt.slotEnd);
      if (slotEndTime < now) {
        await this.prisma.appointment.update({
          where: { id: appt.id },
          data: { status: AppointmentStatus.NO_SHOW },
        });
      }
    }
  }

  async findExpiredPending(now: Date): Promise<AppointmentRecord[]> {
    const expired = await this.prisma.appointment.findMany({
      where: {
        status: { in: [AppointmentStatus.PENDING, AppointmentStatus.PAYMENT_FAILED_HOLD] },
        expiresAt: { lt: now }
      }
    });
    return expired.map(e => this.mapper.toRecord(e));
  }

  async checkConflict(data: {
    patientId: string;
    doctorId: string;
    appointmentDate: Date;
    startTime: Date;
    endTime: Date;
    excludeAppointmentId?: string;
  }): Promise<{ hasConflict: boolean; type: 'PATIENT_OVERLAP' | 'DOCTOR_FULL' | 'NONE'; message: string }> {
    const { patientId, doctorId, appointmentDate, startTime, endTime, excludeAppointmentId } = data;

    // 1. Check Patient Overlap
    const patientConflict = await this.prisma.appointment.findFirst({
      where: {
        patientId,
        id: { not: excludeAppointmentId },
        status: { in: ["PENDING", "BOOKED", "PAYMENT_FAILED_HOLD"] },
        OR: [
          {
            startTime: { lt: endTime },
            endTime: { gt: startTime }
          }
        ]
      }
    });

    if (patientConflict) {
      return {
        hasConflict: true,
        type: 'PATIENT_OVERLAP',
        message: "You already have another appointment during this time. Please choose another available slot."
      };
    }

    // 2. Check Doctor Capacity for the slot
    // We use the slotStart/slotEnd logic here as the current system is slot-based
    const slotStart = startTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
    const schedule = await this.getDoctorSchedule(doctorId, appointmentDate.getDay());
    const capacity = schedule?.slotCapacity ?? 5; // Default to 5 if not found

    const activeBookingsCount = await this.prisma.appointment.count({
      where: {
        doctorId,
        id: { not: excludeAppointmentId },
        appointmentDate: {
          gte: new Date(appointmentDate.setHours(0,0,0,0)),
          lte: new Date(appointmentDate.setHours(23,59,59,999))
        },
        slotStart,
        status: { in: ["PENDING", "BOOKED", "PAYMENT_FAILED_HOLD"] }
      }
    });

    if (activeBookingsCount >= capacity) {
      return {
        hasConflict: true,
        type: 'DOCTOR_FULL',
        message: "Selected slot is no longer available. Please choose another slot."
      };
    }

    return { hasConflict: false, type: 'NONE', message: "" };
  }

  async rescheduleAtomic(data: {
    appointmentId: string;
    newDate: Date;
    slotStart: string;
    slotEnd: string;
    startTime: Date;
    endTime: Date;
  }): Promise<AppointmentRecord> {
    return await this.prisma.$transaction(async (tx) => {
      const { appointmentId, newDate, slotStart, slotEnd, startTime, endTime } = data;

      // 1. Fetch current appointment with lock
      const appointment = await tx.appointment.findUnique({
        where: { id: appointmentId }
      });

      if (!appointment) throw new Error("Appointment not found");

      // 2. Re-verify conflict inside transaction
      // (Simplified: in a real production app we'd use a more robust locking strategy)
      
      const patientConflict = await tx.appointment.findFirst({
        where: {
          patientId: appointment.patientId,
          id: { not: appointmentId },
          status: { in: ["PENDING", "BOOKED", "PAYMENT_FAILED_HOLD"] },
          OR: [
            {
              startTime: { lt: endTime },
              endTime: { gt: startTime }
            }
          ]
        }
      });

      if (patientConflict) throw new Error("PATIENT_ALREADY_HAS_APPOINTMENT");

      const schedule = await tx.doctorSchedule.findFirst({
        where: { doctorId: appointment.doctorId, dayOfWeek: newDate.getDay() }
      });
      const capacity = schedule?.slotCapacity ?? 5;

      const activeBookingsCount = await tx.appointment.count({
        where: {
          doctorId: appointment.doctorId,
          id: { not: appointmentId },
          appointmentDate: {
            gte: new Date(new Date(newDate).setHours(0,0,0,0)),
            lte: new Date(new Date(newDate).setHours(23,59,59,999))
          },
          slotStart,
          status: { in: ["PENDING", "BOOKED", "PAYMENT_FAILED_HOLD"] }
        }
      });

      if (activeBookingsCount >= capacity) throw new Error("SLOT_FULL");

      // 3. Perform the update
      const updated = await tx.appointment.update({
        where: { id: appointmentId },
        data: {
          appointmentDate: new Date(Date.UTC(newDate.getUTCFullYear(), newDate.getUTCMonth(), newDate.getUTCDate())),
          slotStart,
          slotEnd,
          startTime,
          endTime,
          status: "BOOKED", // Ensure status is BOOKED after reschedule
          lastStatusChangedAt: new Date(),
        }
      });

      // 4. Create audit log
      await tx.appointmentAuditLog.create({
        data: {
          appointmentId,
          action: "RESCHEDULED",
          actorId: appointment.patientId, // Defaulting to patient, can be improved with actorId pass-in
          actorRole: "PATIENT",
          oldStatus: appointment.status,
          newStatus: "BOOKED",
          details: { 
            oldDate: appointment.appointmentDate, 
            newDate, 
            oldSlot: appointment.slotStart, 
            newSlot: slotStart 
          }
        }
      });

      return this.mapper.toRecord(updated);
    });
  }

  async cancelMany(ids: string[]): Promise<void> {
    await this.prisma.appointment.updateMany({
      where: { id: { in: ids } },
      data: { status: AppointmentStatus.EXPIRED }
    });
  }

  async createAuditLog(log: AppointmentAuditLogInput): Promise<void> {
    await this.prisma.appointmentAuditLog.create({
      data: {
        appointmentId: log.appointmentId,
        action: log.action,
        actorId: log.actorId,
        actorRole: log.actorRole as Role,
        oldStatus: log.oldStatus as AppointmentStatus,
        newStatus: log.newStatus as AppointmentStatus,
        details: log.details as Prisma.InputJsonValue || {},
      }
    });
  }

  async createRescheduleProposal(proposal: RescheduleProposalInput): Promise<any> {
    return await this.prisma.rescheduleProposal.create({
      data: {
        appointmentId: proposal.appointmentId,
        proposedById: proposal.proposedById,
        proposedByRole: proposal.proposedByRole as Role,
        newDate: proposal.newDate,
        newSlotStart: proposal.newSlotStart,
        newSlotEnd: proposal.newSlotEnd,
        reason: proposal.reason,
        expiresAt: proposal.expiresAt,
        status: "PENDING"
      }
    });
  }

  async getProposalsByAppointmentId(appointmentId: string): Promise<any[]> {
    return await this.prisma.rescheduleProposal.findMany({
      where: { appointmentId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findProposalById(id: string): Promise<any | null> {
    return await this.prisma.rescheduleProposal.findUnique({
      where: { id }
    });
  }

  async updateProposalStatus(id: string, status: string): Promise<void> {
    await this.prisma.rescheduleProposal.update({
      where: { id },
      data: { status: status as any }
    });
  }

  async findImpactedAppointments(doctorId: string, startDate: Date, endDate: Date): Promise<string[]> {
    const appointments = await this.prisma.appointment.findMany({
      where: {
        doctorId,
        appointmentDate: {
          gte: startDate,
          lte: endDate
        },
        status: {
          in: ["BOOKED", "PENDING"]
        }
      },
      select: { id: true }
    });
    return appointments.map(a => a.id);
  }

  async reassignAtomic(data: ReassignInput): Promise<AppointmentRecord> {
    return await this.prisma.$transaction(async (tx) => {
      const { appointmentId, newDoctorId, reassignedBy, reason, newDate, newSlotStart, newSlotEnd } = data;

      const original = await tx.appointment.findUnique({
        where: { id: appointmentId }
      });

      if (!original) throw new Error("Appointment not found");

      // Update original appointment
      await tx.appointment.update({
        where: { id: appointmentId },
        data: {
          status: "REASSIGNED",
          lastStatusChangedAt: new Date(),
        }
      });

      // Create audit log for reassignment
      await tx.appointmentAuditLog.create({
        data: {
          appointmentId,
          action: "REASSIGNED",
          actorId: reassignedBy,
          actorRole: "ADMIN", // Defaulting to ADMIN for now as it's an admin/system action
          oldStatus: original.status,
          newStatus: "REASSIGNED",
          details: { newDoctorId, reason }
        }
      });

      // Create new appointment for the new doctor
      const newApp = await tx.appointment.create({
        data: {
          patientId: original.patientId,
          doctorId: newDoctorId,
          appointmentDate: newDate || original.appointmentDate,
          slotStart: newSlotStart || original.slotStart,
          slotEnd: newSlotEnd || original.slotEnd,
          status: "BOOKED",
          reason: reason || original.reason,
          parentAppointmentId: appointmentId,
          paymentStatus: original.paymentStatus,
          paymentMethod: original.paymentMethod,
        }
      });

      // Link them
      await tx.appointment.update({
        where: { id: appointmentId },
        data: { rescheduledToId: newApp.id }
      });

      return this.mapper.toRecord(newApp);
    });
  }
}



