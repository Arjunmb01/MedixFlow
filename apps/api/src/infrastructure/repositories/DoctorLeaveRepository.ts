import { PrismaClient } from "@prisma/client";
import { IDoctorLeaveRepository, CreateLeaveInput } from "@/domain/repositories/IDoctorLeaveRepository";
import { DoctorLeave, LeaveStatus } from "@/domain/entities/DoctorLeave";

function mapToDomain(raw: any): DoctorLeave {
  return new DoctorLeave(
    raw.id,
    raw.doctorId,
    raw.startDate,
    raw.endDate,
    raw.reason,
    raw.status as LeaveStatus,
    raw.createdAt,
    raw.updatedAt
  );
}

export class DoctorLeaveRepository implements IDoctorLeaveRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(doctorId: string, data: CreateLeaveInput): Promise<DoctorLeave> {
    const raw = await this.prisma.doctorLeave.create({
      data: {
        doctorId,
        startDate: data.startDate,
        endDate: data.endDate,
        reason: data.reason,
        status: "PENDING",
      },
    });
    return mapToDomain(raw);
  }

  async findByDoctor(doctorId: string): Promise<DoctorLeave[]> {
    const rows = await this.prisma.doctorLeave.findMany({
      where: { doctorId },
      orderBy: { createdAt: "desc" },
    });
    return rows.map(mapToDomain);
  }

  async findAll(filters?: { status?: LeaveStatus; search?: string; page?: number; limit?: number }): Promise<{ leaves: DoctorLeave[]; total: number }> {
    const { status, search, page = 1, limit = 10 } = filters || {};
    const skip = (page - 1) * limit;

    const where: any = {
      ...(status && { status }),
      ...(search && {
        OR: [
          { doctor: { firstName: { contains: search, mode: "insensitive" } } },
          { doctor: { lastName: { contains: search, mode: "insensitive" } } },
          { doctor: { user: { email: { contains: search, mode: "insensitive" } } } },
        ],
      }),
    };

    const [rows, total] = await Promise.all([
      this.prisma.doctorLeave.findMany({
        where,
        include: {
          doctor: {
            select: {
              firstName: true,
              lastName: true,
              user: { select: { email: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      this.prisma.doctorLeave.count({ where }),
    ]);

    const leaves = rows.map((row) => {
      const leave = mapToDomain(row);
      (leave as any).doctorName = `${row.doctor.firstName} ${row.doctor.lastName}`;
      (leave as any).doctorEmail = row.doctor.user.email;
      return leave;
    });

    return { leaves, total };
  }

  async findById(id: string): Promise<DoctorLeave | null> {
    const raw = await this.prisma.doctorLeave.findUnique({ where: { id } });
    if (!raw) return null;
    return mapToDomain(raw);
  }

  async update(id: string, data: Partial<{ status: LeaveStatus }>): Promise<DoctorLeave> {
    const raw = await this.prisma.doctorLeave.update({
      where: { id },
      data: {
        ...(data.status && { status: data.status }),
      },
    });
    return mapToDomain(raw);
  }

  async cancel(id: string, doctorId: string): Promise<DoctorLeave> {
    const leave = await this.prisma.doctorLeave.findUnique({ where: { id } });
    if (!leave || leave.doctorId !== doctorId) {
      throw new Error("Leave not found or unauthorized.");
    }
    if (leave.status !== "PENDING") {
      throw new Error("Only PENDING leaves can be cancelled.");
    }
    const raw = await this.prisma.doctorLeave.delete({ where: { id } });
    return mapToDomain({ ...raw, status: "REJECTED" });
  }
}
