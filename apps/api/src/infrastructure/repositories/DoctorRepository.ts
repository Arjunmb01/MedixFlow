import { prisma } from "@/infrastructure/database/prismaClient";
import { PrismaClient } from "@prisma/client";
import { IDoctorRepository } from "@/domain/repositories/IDoctorRepository";
import { BaseRepository } from "./BaseRepository";
// We'll need the mapper too.

export class DoctorRepository extends BaseRepository<any, any, any> implements IDoctorRepository {
    protected model = prisma.doctorProfile;

    async findById(userId: string) {
        const result = await prisma.doctorProfile.findUnique({
            where: { id: userId },
            include: {
                user: {
                    select: { id: true, email: true, passwordHash: true, status: true, createdAt: true }
                },
                specialization: true,
                schedules: true
            }
        });
        return result ? { ...result, specialty: (result as any).specialization?.name } : null;
    }

    async getProfile(userId: string) {
        const result = await prisma.doctorProfile.findUnique({
            where: { id: userId },
            include: {
                user: {
                    select: { id: true, email: true, status: true, createdAt: true }
                },
                specialization: true,
                schedules: {
                    orderBy: { dayOfWeek: "asc" }
                }
            }
        });
        return result ? { ...result, specialty: (result as any).specialization?.name } : null;
    }

    async updateProfile(userId: string, data: any) {
        const result = await prisma.doctorProfile.update({
            where: { id: userId },
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
                consultationFee: data.consultationFee,
                bio: data.bio,
                avatarUrl: data.avatarUrl,
            },
            include: {
                user: {
                    select: { id: true, email: true, status: true }
                },
                specialization: true,
                schedules: true
            }
        });
        return { ...result, specialty: (result as any).specialization?.name };
    }

    async updatePassword(userId: string, passwordHash: string) {
        return prisma.user.update({
            where: { id: userId },
            data: { passwordHash }
        });
    }

    async getDashboardStats(userId: string) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const [totalAppointments, todayAppointmentsCount, completedToday, pendingToday, todayAppointments] = await Promise.all([
            prisma.appointment.count({ where: { doctorId: userId } }),
            prisma.appointment.count({
                where: {
                    doctorId: userId,
                    appointmentDate: { gte: today, lt: tomorrow }
                }
            }),
            prisma.appointment.count({
                where: {
                    doctorId: userId,
                    appointmentDate: { gte: today, lt: tomorrow },
                    status: "COMPLETED"
                }
            }),
            prisma.appointment.count({
                where: {
                    doctorId: userId,
                    appointmentDate: { gte: today, lt: tomorrow },
                    status: { in: ["PENDING", "CONFIRMED"] }
                }
            }),
            prisma.appointment.findMany({
                where: {
                    doctorId: userId,
                    appointmentDate: { gte: today, lt: tomorrow },
                    status: { in: ["PENDING", "CONFIRMED"] }
                },
                include: {
                    patient: true
                },
                orderBy: {
                    slotStart: "asc"
                }
            })
        ]);

        return {
            totalAppointments,
            todayAppointmentsCount,
            completedToday,
            pendingToday,
            todayAppointments
        };
    }

    async getConsultedPatients(doctorId: string) {
        const appointments = await prisma.appointment.findMany({
            where: {
                doctorId,
                status: "COMPLETED",
            },
            include: {
                patient: true,
                consultation: {
                    include: {
                        medicalRecord: true,
                    },
                },
            },
            orderBy: {
                appointmentDate: "desc",
            },
        });

        // Deduplicate patients, keep the latest appointment for each patient
        const patientMap = new Map<string, typeof appointments[0]>();
        for (const apt of appointments) {
            if (!patientMap.has(apt.patientId)) {
                patientMap.set(apt.patientId, apt);
            }
        }

        return Array.from(patientMap.values()).map((apt) => ({
            patientId: apt.patientId,
            firstName: apt.patient.firstName,
            lastName: apt.patient.lastName,
            phone: apt.patient.phone,
            gender: apt.patient.gender,
            lastVisit: apt.appointmentDate,
            lastDiagnosis: apt.consultation?.medicalRecord?.diagnosis || null,
            totalVisits: appointments.filter((a) => a.patientId === apt.patientId).length,
        }));
    }

    async getDoctorPrescriptions(doctorId: string) {
        const appointments = await prisma.appointment.findMany({
            where: {
                doctorId,
                status: "COMPLETED",
                consultation: {
                    prescription: {
                        isNot: null,
                    },
                },
            },
            include: {
                patient: true,
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
                appointmentDate: "desc",
            },
        });
        return appointments;
    }

    async updatePrescription(prescriptionId: string, data: { instructions?: string; medicines: { name: string; dosage: string; frequency: string; duration: string }[] }) {
        return prisma.$transaction(async (tx: any) => {
            // Update instructions
            await tx.prescription.update({
                where: { id: prescriptionId },
                data: { instructions: data.instructions || null },
            });

            // Delete old medicines and create new ones
            await tx.medicine.deleteMany({ where: { prescriptionId } });
            await tx.medicine.createMany({
                data: data.medicines.map((m: any) => ({
                    prescriptionId,
                    name: m.name,
                    dosage: m.dosage,
                    frequency: m.frequency,
                    duration: m.duration,
                })),
            });

            // Return updated prescription with medicines
            return tx.prescription.findUnique({
                where: { id: prescriptionId },
                include: { medicines: true },
            });
        });
    }

    async updateSchedules(userId: string, schedules: any[]) {
        return prisma.$transaction([
            prisma.doctorSchedule.deleteMany({
                where: { doctorId: userId }
            }),
            prisma.doctorSchedule.createMany({
                data: schedules.map(s => ({
                    ...s,
                    doctorId: userId
                }))
            })
        ]);
    }

    async getDoctorsFiltered(filters: any) {
        const where: any = {
            user: {
                status: "ACTIVE"
            }
        };

        if (filters.specialty && filters.specialty !== "All") {
            where.specialization = { name: filters.specialty };
        }

        if (filters.search) {
            where.OR = [
                { firstName: { contains: filters.search, mode: 'insensitive' } },
                { lastName: { contains: filters.search, mode: 'insensitive' } },
                { specialization: { name: { contains: filters.search, mode: 'insensitive' } } }
            ];
        }

        if (filters.availableToday) {
            const today = new Date().getDay();
            where.schedules = {
                some: {
                    dayOfWeek: today
                }
            };
        }

        if (filters.minFee !== undefined || filters.maxFee !== undefined) {
            where.consultationFee = {};
            if (filters.minFee !== undefined) where.consultationFee.gte = filters.minFee;
            if (filters.maxFee !== undefined) where.consultationFee.lte = filters.maxFee;
        }

        const [doctors, total] = await Promise.all([
            prisma.doctorProfile.findMany({
                where,
                include: {
                    specialization: true,
                    schedules: true
                },
                orderBy: {
                    rating: 'desc'
                },
                skip: filters.skip,
                take: filters.take
            }),
            prisma.doctorProfile.count({ where })
        ]);

        // I'll refactor the DoctorMapper later or just return data as is for now.
        return { doctors: doctors, total };
    }

    async findProfileById(doctorId: string) {
        const result = await prisma.doctorProfile.findUnique({
            where: { id: doctorId },
            include: {
                specialization: true,
                schedules: {
                    orderBy: { dayOfWeek: "asc" }
                }
            }
        });
        return result ? { ...result, specialty: (result as any).specialization?.name } : null;
    }
}
