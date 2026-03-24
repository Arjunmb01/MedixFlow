import { prisma } from "@/infrastructure/database/prismaClient";
import { MESSAGES } from "@/shared/constants";
import { IStaffRepository } from "@/domain/repositories/IStaffRepository";
import { UserStatus } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";

import { BaseRepository } from "./BaseRepository";

export class StaffRepository extends BaseRepository<any, any, any> implements IStaffRepository {
    protected model = prisma.doctorProfile;

    async getDoctors(query: any) {
        const { search, specialty: specialization, status, page = 1, limit = 10 } = query;
        const skip = (page - 1) * limit;

        const where: any = {
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

        if (status) {
            where.user = { ...where.user, status };
        }

        const [doctors, total] = await Promise.all([
            prisma.doctorProfile.findMany({
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
            prisma.doctorProfile.count({ where })
        ]);

        return {
            doctors: doctors.map((d: any) => ({
                ...d,
                specialty: (d as any).specialization?.name
            })),
            stats: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    async createDoctor(data: any, temporaryPassword?: string) {
        const existingUser = await prisma.user.findUnique({
            where: { email: data.email }
        });

        if (existingUser) {
            throw new Error(MESSAGES.USER_ALREADY_EXISTS);
        }

        const passwordHash = temporaryPassword 
            ? await bcrypt.hash(temporaryPassword, 10)
            : "PENDING_SETUP";

        return prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    email: data.email,
                    passwordHash,
                    role: "DOCTOR",
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
                                create: data.schedules
                            }
                        }
                    }
                }
            });

            const setupToken = await tx.passwordSetupToken.create({
                data: {
                    userId: user.id,
                    token: uuidv4(),
                    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
                }
            });

            return { user, setupToken };
        });
    }

    async updateDoctor(doctorId: string, data: any) {
        return prisma.$transaction(async (tx) => {
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

            if (data.email && data.email !== (profile as any).user.email) {
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
                    data: data.schedules.map((s: any) => ({
                        ...s,
                        doctorId: profile.id
                    }))
                });
            }

            return {
                ...profile,
                specialty: (profile as any).specialization?.name
            };
        }, {
            timeout: 15000 
        });
    }

    async blockDoctor(userId: string, status: UserStatus) {
        return prisma.user.update({
            where: { id: userId },
            data: { status }
        });
    }

    async deleteDoctor(userId: string) {
        return prisma.user.update({
            where: { id: userId },
            data: {
                deletedAt: new Date(),
                status: "INACTIVE"
            }
        });
    }

    async setupPassword(token: string, password: string) {
        const hashedPassword = await bcrypt.hash(password, 10);
        
        return prisma.$transaction(async (tx) => {
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
