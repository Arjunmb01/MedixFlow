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
                experienceYears: data.experienceYears,
                languages: data.languages,
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

    async getDashboardStats(userId: string, date?: Date): Promise<DoctorDashboardStats> {
        // This will be deprecated/simplified as logic moves to Use Case
        const raw = await this.getRawStats(userId, date || new Date());
        
        const sortedTodayAppointments = raw.todayAppointments
            .sort((a, b) => {
                const getStatusPriority = (apt: PrismaAppointmentWithPatient) => {
                    if (apt.consultation?.status === "IN_PROGRESS") return 3;
                    if (apt.consultation?.status === "WAITING") return 2;
                    if (apt.consultation?.status === "COMPLETED") return 1;
                    return 0;
                };

                const priorityA = getStatusPriority(a as PrismaAppointmentWithPatient);
                const priorityB = getStatusPriority(b as PrismaAppointmentWithPatient);

                if (priorityA !== priorityB) return priorityB - priorityA;
                // @ts-ignore - Prisma types might be tricky here, but avoiding 'any'
                return (a as any).slotStart.localeCompare((b as any).slotStart);
            })
            .map((apt) => this.mapper.toAppointmentPreview(apt as PrismaAppointmentWithPatient));

        return {
            totalAppointments: raw.totalAppointments,
            completedAppointments: raw.completedAppointments,
            pendingAppointments: raw.pendingAppointments,
            totalPatients: raw.uniquePatientsCount,
            todayAppointments: sortedTodayAppointments,
            todayAppointmentsCount: raw.todayAppointments.length,
            pendingToday: raw.todayAppointments.filter(a => ["PENDING", "BOOKED"].includes(a.status)).length,
            completedToday: raw.todayAppointments.filter(a => a.status === "COMPLETED").length,
            totalEarnings: raw.totalEarnings,
            dashboardDate: raw.dashboardDate
        };
    }

    async getRawStats(userId: string, date: Date) {
        const todaySearch = new Date(date);
        todaySearch.setHours(0, 0, 0, 0);
        const tomorrowSearch = new Date(todaySearch);
        tomorrowSearch.setDate(tomorrowSearch.getDate() + 1);

        const [
            totalAppointments, 
            completedAppointments, 
            pendingAppointments, 
            uniquePatientsCount,
            todayAppointmentsResult,
            earningsResult
        ] = await Promise.all([
            this._prisma.appointment.count({ where: { doctorId: userId } }),
            this._prisma.appointment.count({ where: { doctorId: userId, status: "COMPLETED" } }),
            this._prisma.appointment.count({ where: { doctorId: userId, status: { in: ["PENDING", "BOOKED"] } } }),
            this._prisma.appointment.groupBy({
                by: ['patientId'],
                where: { doctorId: userId },
                _count: { patientId: true }
            }).then(res => res.length),
            this._prisma.appointment.findMany({
                where: {
                    doctorId: userId,
                    appointmentDate: { gte: todaySearch, lt: tomorrowSearch },
                    status: { not: "CANCELLED" }
                },
                include: {
                    patient: true,
                    consultation: true
                },
                orderBy: {
                    slotStart: "asc"
                }
            }),
            this._prisma.payment.aggregate({
                where: {
                    appointment: { doctorId: userId, status: "COMPLETED" },
                    status: "PAID"
                },
                _sum: { amount: true }
            })
        ]);

        let finalTodayAppointments = todayAppointmentsResult;
        let dashboardDate = todaySearch;

        if (finalTodayAppointments.length === 0) {
            const nextAppointments = await this._prisma.appointment.findMany({
                where: {
                    doctorId: userId,
                    appointmentDate: { gte: tomorrowSearch },
                    status: { in: ["PENDING", "BOOKED"] }
                },
                include: {
                    patient: true,
                    consultation: true
                },
                orderBy: [
                    { appointmentDate: "asc" },
                    { slotStart: "asc" }
                ],
                take: 10
            });

            if (nextAppointments.length > 0) {
                finalTodayAppointments = nextAppointments;
                dashboardDate = new Date(nextAppointments[0].appointmentDate);
                dashboardDate.setHours(0, 0, 0, 0);
            }
        }

        const totalEarnings = earningsResult._sum.amount || 0;

        return {
            totalAppointments,
            completedAppointments,
            pendingAppointments,
            uniquePatientsCount,
            todayAppointments: finalTodayAppointments.map(apt => ({
                id: apt.id,
                patientId: apt.patientId,
                patient: {
                    id: apt.patient.id,
                    patientId: apt.patient.patientId,
                    firstName: apt.patient.firstName,
                    lastName: apt.patient.lastName,
                    gender: apt.patient.gender
                },
                slotStart: apt.slotStart,
                slotEnd: apt.slotEnd,
                status: apt.status,
                appointmentDate: apt.appointmentDate,
                doctorId: apt.doctorId,
                createdAt: apt.createdAt,
                lastStatusChangedAt: apt.lastStatusChangedAt,
                consultation: apt.consultation ? {
                    id: apt.consultation.id,
                    status: apt.consultation.status
                } : undefined
            })),
            totalEarnings,
            dashboardDate
        };
    }

    async getConsultedPatients(doctorId: string): Promise<ConsultedPatientRecord[]> {
        // FIX [PERFORMANCE]: Query PatientProfile directly using EXISTS (some) to avoid OOM with large datasets
        const patients = await this._prisma.patientProfile.findMany({
            where: {
                appointments: {
                    some: {
                        doctorId,
                        status: "COMPLETED",
                    }
                }
            },
            include: {
                appointments: {
                    where: {
                        doctorId,
                        status: "COMPLETED"
                    },
                    orderBy: {
                        appointmentDate: "desc"
                    },
                    take: 1
                }
            }
        });

        return patients.map(p => ({
            id: p.appointments[0]?.id || "",
            firstName: p.firstName,
            lastName: p.lastName,
            patientId: p.patientId,
            lastConsultationDate: p.appointments[0]?.appointmentDate || new Date()
        }));
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

    async getDoctorsFiltered(filters: DoctorFilters): Promise<PaginatedDoctors> {
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

        if (filters.experienceYears !== undefined) {
            where.experienceYears = { gte: filters.experienceYears };
        }

        if (filters.minRating !== undefined) {
            where.rating = { gte: filters.minRating };
        }

        if (filters.language) {
            where.languages = { has: filters.language };
        }

        const page = filters.page || 1;
        const limit = filters.limit || 10;
        const skip = (page - 1) * limit;
        const take = limit;

        let orderBy: Prisma.DoctorProfileOrderByWithRelationInput = { rating: 'desc' };
        if (filters.sortBy) {
            switch (filters.sortBy) {
                case 'fee_asc': orderBy = { consultationFee: 'asc' }; break;
                case 'fee_desc': orderBy = { consultationFee: 'desc' }; break;
                case 'rating_desc': orderBy = { rating: 'desc' }; break;
                case 'experience_desc': orderBy = { experienceYears: 'desc' }; break;
                case 'name_asc': orderBy = { firstName: 'asc' }; break;
            }
        }

        const [doctors, total] = await Promise.all([
            this._prisma.doctorProfile.findMany({
                where,
                include: {
                    user: true,
                    specialization: true,
                },
                orderBy,
                skip,
                take
            }),
            this._prisma.doctorProfile.count({ where })
        ]);

        return { 
            data: doctors.map(d => this.mapper.toDomain(d as PrismaDoctorWithUserAndSpec)!).filter(Boolean), 
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
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
            where: { doctorId, dayOfWeek }
        });
        return schedules.map(s => this.mapper.toSchedule(s));
    }

    async getBreaksByDay(doctorId: string, dayOfWeek: number): Promise<any[]> {
        return this._prisma.doctorBreak.findMany({
            where: {
                doctorId,
                dayOfWeek
            }
        });
    }
}

