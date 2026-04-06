import { 
    DoctorProfile, 
    DoctorDashboardStats, 
    DoctorSchedule, 
    ConsultedPatientRecord, 
    PrescriptionRecord, 
    PaginatedDoctors,
    DoctorFilters
} from "@/domain/value-objects/types/doctor.repository.types";
import { 
    PrismaDoctorWithUserAndSpec, 
    PrismaStaffDoctor, 
    PrismaConsultedPatient, 
    PrismaPrescriptionFull,
    PrismaAppointmentWithPatient,
    DoctorMapper
} from "@/infrastructure/database/mappers/DoctorMapper";
import { UserStatus, PrismaClient, Prisma } from "@prisma/client";
import { Doctor } from "@/domain/entities/Doctor";
import { SchedulingPolicy } from "@/domain/services/SchedulingPolicy";
import { IDoctorProfileRepository, IDoctorStatsRepository, IDoctorMedicalRepository } from "@/domain/repositories/IDoctorRepository";


export class DoctorRepository implements IDoctorProfileRepository, IDoctorStatsRepository, IDoctorMedicalRepository {
    private readonly model: Prisma.DoctorProfileDelegate;

    constructor(
        private readonly _prisma: PrismaClient,
        private readonly mapper: DoctorMapper,
        private readonly schedulingPolicy: SchedulingPolicy
    ) {

        this.model = this._prisma.doctorProfile;
    }

    async findById(userId: string): Promise<Doctor | null> {
        const result = await this._prisma.doctorProfile.findUnique({
            where: { id: userId },
            include: {
                user: true,
                specialization: true,
            }
        });
        return result ? this.mapper.toDomain(result as PrismaDoctorWithUserAndSpec) : null;
    }

    async getProfile(userId: string): Promise<DoctorProfile | null> {
        const result = await this._prisma.doctorProfile.findUnique({
            where: { id: userId },
            include: {
                user: true,
                specialization: true,
                schedules: {
                    orderBy: { dayOfWeek: "asc" }
                }
            }
        });
        return result ? this.mapper.toProfile(result as PrismaDoctorWithUserAndSpec) : null;
    }

    async updateProfile(userId: string, data: Partial<DoctorProfile>): Promise<DoctorProfile> {
        const result = await this._prisma.doctorProfile.update({
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
                user: true,
                specialization: true,
                schedules: true
            }
        });
        return this.mapper.toProfile(result as PrismaDoctorWithUserAndSpec)!;
    }

    async updatePassword(userId: string, passwordHash: string): Promise<void> {
        await this._prisma.user.update({
            where: { id: userId },
            data: { passwordHash }
        });
    }

    async getDashboardStats(userId: string): Promise<DoctorDashboardStats> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const [
            totalAppointments, 
            completedAppointments, 
            pendingAppointments, 
            uniquePatientsCount,
            todayAppointmentsData
        ] = await Promise.all([
            this._prisma.appointment.count({ where: { doctorId: userId } }),
            this._prisma.appointment.count({ where: { doctorId: userId, status: "COMPLETED" } }),
            this._prisma.appointment.count({ where: { doctorId: userId, status: { in: ["PENDING", "CONFIRMED"] } } }),
            this._prisma.appointment.groupBy({
                by: ['patientId'],
                where: { doctorId: userId },
                _count: { patientId: true }
            }).then(res => res.length),
            this._prisma.appointment.findMany({
                where: {
                    doctorId: userId,
                    appointmentDate: { gte: today, lt: tomorrow }
                },
                include: {
                    patient: true
                },
                orderBy: {
                    slotStart: "asc"
                }
            })
        ]);

        const pendingToday = todayAppointmentsData.filter(a => ["PENDING", "CONFIRMED"].includes(a.status)).length;
        const completedToday = todayAppointmentsData.filter(a => a.status === "COMPLETED").length;

        // Calculate total earnings
        const completedApts = await this._prisma.appointment.findMany({
            where: { doctorId: userId, status: "COMPLETED" },
            include: { doctor: true }
        });
        const totalEarnings = completedApts.reduce((acc, apt) => acc + (apt.doctor.consultationFee || 0), 0);

        return {
            totalAppointments,
            completedAppointments,
            pendingAppointments,
            totalPatients: uniquePatientsCount,
            todayAppointments: todayAppointmentsData.map((apt: any) => this.mapper.toAppointmentPreview(apt as PrismaAppointmentWithPatient)),
            todayAppointmentsCount: todayAppointmentsData.length,
            pendingToday,
            completedToday,
            totalEarnings
        };
    }

    async getConsultedPatients(doctorId: string): Promise<ConsultedPatientRecord[]> {
        const appointments = await this._prisma.appointment.findMany({
            where: {
                doctorId,
                status: "COMPLETED",
            },
            include: {
                patient: true,
            },
            orderBy: {
                appointmentDate: "desc",
            },
        });

        const patientMap = new Map<string, PrismaConsultedPatient>();
        for (const apt of appointments) {
            if (!patientMap.has(apt.patientId)) {
                patientMap.set(apt.patientId, apt as PrismaConsultedPatient);
            }
        }

        return Array.from(patientMap.values()).map((apt) => this.mapper.toConsultedPatient(apt));
    }

    async getDoctorPrescriptions(doctorId: string): Promise<PrescriptionRecord[]> {
        const appointments = await this._prisma.appointment.findMany({
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
        });
        return appointments.map(apt => this.mapper.toPrescriptionRecord(apt as PrismaPrescriptionFull));
    }

    async updatePrescription(prescriptionId: string, data: Partial<PrescriptionRecord>): Promise<PrescriptionRecord> {
        return this._prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            const updateData: Prisma.PrescriptionUpdateInput = {};
            if (data.instructions !== undefined) updateData.instructions = data.instructions;

            if (Object.keys(updateData).length > 0) {
                await tx.prescription.update({
                    where: { id: prescriptionId },
                    data: updateData,
                });
            }

            if (data.medicines) {
                await tx.medicine.deleteMany({ where: { prescriptionId } });
                await tx.medicine.createMany({
                    data: data.medicines.map((m) => ({
                        prescriptionId,
                        name: m.name,
                        dosage: m.dosage,
                        frequency: m.frequency,
                        duration: m.duration,
                    })),
                });
            }

            const result = await tx.appointment.findFirst({
                where: { consultation: { prescription: { id: prescriptionId } } },
                include: {
                    patient: true,
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
            });

            if (!result) throw new Error("Prescription not found");
            return this.mapper.toPrescriptionRecord(result as PrismaPrescriptionFull);
        });
    }

    async updateSchedules(userId: string, schedules: DoctorSchedule[]): Promise<void> {
        await this._prisma.$transaction([
            this._prisma.doctorSchedule.deleteMany({
                where: { doctorId: userId }
            }),
            this._prisma.doctorSchedule.createMany({
                data: schedules.map(s => {
                    const duration = s.slotDurationMinutes;
                    const capacity = this.schedulingPolicy.calculateSlotCapacity(duration);
                    
                    return {
                        doctorId: userId,
                        dayOfWeek: s.dayOfWeek,
                        startTime: s.startTime,
                        endTime: s.endTime,
                        slotDurationMinutes: duration,
                        slotCapacity: capacity,
                        fullDay: s.fullDay || false,
                        consultationType: s.consultationType || 'CLINIC',
                    };
                })
            })
        ]);
    }

    async getDoctorsFiltered(filters: DoctorFilters & { page: number; limit: number }): Promise<PaginatedDoctors> {
        const where: Prisma.DoctorProfileWhereInput = {
            user: {
                status: (filters.status as UserStatus) || UserStatus.ACTIVE
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

        const skip = (filters.page - 1) * filters.limit;
        const take = filters.limit;

        const [doctors, total] = await Promise.all([
            this._prisma.doctorProfile.findMany({
                where,
                include: {
                    user: true,
                    specialization: true,
                },
                orderBy: {
                    rating: 'desc'
                },
                skip,
                take
            }),
            this._prisma.doctorProfile.count({ where })
        ]);

        return { 
            data: doctors.map(d => this.mapper.toDomain(d as PrismaDoctorWithUserAndSpec)!).filter(Boolean), 
            meta: {
                total,
                page: filters.page,
                limit: filters.limit,
                totalPages: Math.ceil(total / filters.limit)
            }
        };
    }

    async findProfileById(doctorId: string): Promise<DoctorProfile | null> {
        const result = await this._prisma.doctorProfile.findUnique({
            where: { id: doctorId },
            include: {
                user: true,
                specialization: true,
                schedules: {
                    orderBy: { dayOfWeek: "asc" }
                }
            }
        });
        return result ? this.mapper.toProfile(result as PrismaDoctorWithUserAndSpec) : null;
    }

    async getSchedulesByDay(doctorId: string, dayOfWeek: number): Promise<DoctorSchedule[]> {
        const schedules = await this._prisma.doctorSchedule.findMany({
            where: {
                doctorId: doctorId,
                dayOfWeek: dayOfWeek
            }
        });

        return schedules.map(s => this.mapper.toSchedule(s as any));
    }
}

