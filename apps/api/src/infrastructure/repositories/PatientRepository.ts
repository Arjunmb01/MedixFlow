import { prisma } from "@/infrastructure/database/prismaClient";
import { IPatientRepository } from "@/domain/repositories/IPatientRepository";
import { BaseRepository } from "./BaseRepository";

export class PatientRepository extends BaseRepository<any, any, any> implements IPatientRepository {
  protected model = prisma.patientProfile;

  async findById(id: string) {
    return prisma.patientProfile.findUnique({
      where: { id },
      include: {
        emergencyContacts: true,
        user: true
      }
    });
  }

  async updatePatient(id: string, data: any) {
    const nameParts = data.name.trim().split(/\s+/);
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ");

    return prisma.patientProfile.update({
      where: { id },
      data: {
        firstName,
        lastName,
        phone: data.mobile,
        bloodGroup: data.bloodGroup,
        gender: data.gender as any
      }
    });
  }

  async updatePassword(id: string, passwordHash: string) {
    return prisma.user.update({
      where: { id },
      data: { passwordHash }
    });
  }

  async replaceEmergencyContacts(patientId: string, contacts: any[]) {
    await prisma.emergencyContact.deleteMany({
      where: { patientId }
    });

    return prisma.emergencyContact.createMany({
      data: contacts.map(c => ({
        ...c,
        patientId
      }))
    });
  }

  async getPatients(query: { search?: string; status?: string; gender?: string; page: number; limit: number }) {
    const { search, status, gender, page, limit } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      user: {
        deletedAt: null,
        role: { not: 'ADMIN' }
      }
    };

    if (status) {
      where.user = { ...where.user, status };
    }

    if (gender) {
      where.gender = gender;
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { patientId: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [patients, total] = await Promise.all([
      prisma.patientProfile.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              status: true,
              role: true,
              createdAt: true
            }
          },
          _count: {
            select: {
              appointments: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: {
          firstName: "asc"
        }
      }),
      prisma.patientProfile.count({ where })
    ]);

    return {
      data: patients,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async toggleBlock(userId: string, status: any) {
    return prisma.user.update({
      where: { id: userId },
      data: { status }
    });
  }

  async deletePatient(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        deletedAt: new Date(),
        status: "INACTIVE"
      }
    });
  }

  async getStats() {
    const [patientCount, doctorCount] = await Promise.all([
      prisma.patientProfile.count({
        where: { user: { deletedAt: null, role: { not: 'ADMIN' } } }
      }),
      prisma.doctorProfile.count({
        where: { user: { deletedAt: null } }
      })
    ]);

    return {
      patientCount,
      doctorCount
    };
  }
}
