import { PrismaClient, UserStatus, Prisma } from "@prisma/client";
import { MESSAGES } from "@/shared/constants";
import { IStaffRepository } from "@/domain/repositories/IStaffRepository";
import { v4 as uuidv4 } from "uuid";
import { IPasswordHasher } from "@/application/interfaces/IPasswordHasher";
import { DoctorMapper } from "@/infrastructure/database/mappers/DoctorMapper";
import { 
    StaffDoctorFilters, 
    PaginatedStaffDoctors, 
    CreateDoctorInput, 
    UpdateDoctorInput,
    StaffDoctorListItem
} from "@/domain/value-objects/types/staff.repository.types";
import { UserRole } from "@/domain/value-objects/enums/UserRole";

export class StaffRepository implements IStaffRepository {
    constructor(
        private readonly _prisma: PrismaClient,
        private readonly mapper: DoctorMapper,
        private readonly passwordHasher: IPasswordHasher
    ) {}

    async getDoctors(query: StaffDoctorFilters & { page: number; limit: number }): Promise<PaginatedStaffDoctors> {
        const { search, specialty: specialization, status, page, limit } = query;
        const skip = (page - 1) * limit;

        const where: Prisma.DoctorProfileWhereInput = {
            user: {
                deletedAt: null
            }
        };

        if (search) {
            where.OR = [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { user: { email: { contains: search, mode: 'insensitive' } } },
                { specialization: { name: { contains: search, mode: 'insensitive' } } }
            ];
        }

        if (specialization) {
            where.specialization = {
                name: {
                    equals: specialization,
                    mode: 'insensitive'
                }
            };
        }

        if (status && where.user) {
            where.user.status = status;
        }

        const [doctors, total] = await Promise.all([
            this._prisma.doctorProfile.findMany({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            status: true,
                            createdAt: true
                        }
                    },
                    specialization: true,
                    schedules: true
                },
                skip,
                take: limit,
                orderBy: {
                    firstName: "asc"
                }
            }),
            this._prisma.doctorProfile.count({ where })
        ]);

        return {
            doctors: doctors.map((d) => this.mapper.toStaffDoctorListItem(d as any)),
            stats: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    async createDoctor(data: CreateDoctorInput, temporaryPassword?: string): Promise<{ user: any; setupToken: any }> {
        const existingUser = await this._prisma.user.findUnique({
            where: { email: data.email }
        });

        if (existingUser) {
            throw new Error(MESSAGES.USER_ALREADY_EXISTS);
        }

        const password = temporaryPassword || uuidv4();
        const passwordHash = await this.passwordHasher.hash(password);

        return this._prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            const user = await tx.user.create({
                data: {
                    email: data.email,
                    passwordHash,
                    role: UserRole.DOCTOR,
                    status: temporaryPassword ? "ACTIVE" : "INACTIVE",
                    doctorProfile: {
                        create: {
                            firstName: data.firstName,
                            lastName: data.lastName,
                            phone: data.phone,
                            specialization: {
                                connectOrCreate: {
                                    where: { name: data.specialty },
                                    create: { name: data.specialty }
                                }
                            },
                            consultationFee: data.consultationFee,
                            licenseNumber: data.licenseNumber,
                            schedules: {
                                create: data.schedules.map(s => ({
                                    dayOfWeek: s.dayOfWeek,
                                    startTime: s.startTime,
                                    endTime: s.endTime,
                                    slotDurationMinutes: s.slotDurationMinutes,
                                    slotCapacity: s.slotCapacity,
                                    fullDay: s.fullDay,
                                    consultationType: s.consultationType
                                }))
                            }
                        }
                    }
                },
                include: {
                    doctorProfile: {
                        include: {
                            user: true,
                            specialization: true,
                            schedules: true
                        }
                    }
                }
            });

            if (!user.doctorProfile) {
                throw new Error("Failed to create doctor profile");
            }

            const setupTokenData = await tx.passwordSetupToken.create({
                data: {
                    token: uuidv4(),
                    userId: user.id,
                    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h
                }
            });

            return {
                user: this.mapper.toStaffDoctorListItem(user.doctorProfile as any),
                setupToken: setupTokenData.token
            };
        });
    }

    async updateDoctor(doctorId: string, data: UpdateDoctorInput): Promise<StaffDoctorListItem> {
        return this._prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            const profile = await tx.doctorProfile.update({
                where: { id: doctorId },
                data: {
                    firstName: data.firstName,
                    lastName: data.lastName,
                    phone: data.phone,
                    specialization: data.specialty ? {
                        connectOrCreate: {
                            where: { name: data.specialty },
                            create: { name: data.specialty }
                        }
                    } : undefined,
                    licenseNumber: data.licenseNumber,
                    consultationFee: data.consultationFee
                },
                include: { 
                    user: true,
                    specialization: true 
                }
            });

            if (data.email && data.email !== profile.user.email) {
                await tx.user.update({
                    where: { id: profile.id },
                    data: { email: data.email }
                });
            }

            if (data.schedules) {
                await tx.doctorSchedule.deleteMany({
                    where: { doctorId: profile.id }
                });

                await tx.doctorSchedule.createMany({
                    data: data.schedules.map((s) => ({
                        dayOfWeek: s.dayOfWeek,
                        startTime: s.startTime,
                        endTime: s.endTime,
                        slotDurationMinutes: s.slotDurationMinutes,
                        slotCapacity: s.slotCapacity,
                        fullDay: s.fullDay,
                        consultationType: s.consultationType,
                        doctorId: profile.id
                    }))
                });
            }

            // Fetch the final state with all relations for mapping
            const finalProfile = await tx.doctorProfile.findUnique({
                where: { id: profile.id },
                include: {
                    user: true,
                    specialization: true,
                    schedules: true
                }
            });

            if (!finalProfile) {
                throw new Error("Doctor profile not found after update");
            }

            return this.mapper.toStaffDoctorListItem(finalProfile as any);
        }, {
            timeout: 15000 
        });
    }

    async blockDoctor(userId: string, status: UserStatus): Promise<void> {
        await this._prisma.user.update({
            where: { id: userId },
            data: { status }
        });
    }

    async deleteDoctor(userId: string): Promise<void> {
        await this._prisma.user.update({
            where: { id: userId },
            data: {
                deletedAt: new Date(),
                status: "INACTIVE"
            }
        });
    }

    async getDoctorCount(): Promise<number> {
        return this._prisma.doctorProfile.count({
            where: {
                user: {
                    deletedAt: null
                }
            }
        });
    }

    async setupPassword(token: string, password: string): Promise<{ success: boolean }> {
        const hashedPassword = await this.passwordHasher.hash(password);
        
        return this._prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            const setupToken = await tx.passwordSetupToken.findUnique({
                where: { token },
                include: { user: true }
            });

            if (!setupToken) {
                throw new Error(MESSAGES.INVALID_SETUP_TOKEN);
            }

            if (setupToken.expiresAt < new Date()) {
                throw new Error(MESSAGES.SETUP_TOKEN_EXPIRED);
            }

            await tx.user.update({
                where: { id: setupToken.userId },
                data: { 
                    passwordHash: hashedPassword,
                    status: "ACTIVE" 
                }
            });

            await tx.passwordSetupToken.delete({
                where: { id: setupToken.id }
            });

            return { success: true };
        }, {
            timeout: 15000
        });
    }
}
