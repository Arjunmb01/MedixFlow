import { PrismaClient, UserStatus as PrismaUserStatus } from "@prisma/client";
import { IPatientRepository } from "@/domain/repositories/IPatientRepository";
import { IDateTimeService } from "@/domain/services/IDateTimeService";
import { UserStatus } from "@/domain/value-objects/enums/UserStatus";

import { PatientMapper, PrismaPatientWithUser } from "@/infrastructure/database/mappers/PatientMapper";
import { Patient } from "@/domain/entities/Patient";
import { 
    PatientProfile, 
    EmergencyContact, 
    PaginatedPatients, 
    PatientFilters 
} from "@/domain/value-objects/types/patient.repository.types";

import { Prisma } from "@prisma/client";

export class PatientRepository implements IPatientRepository {
    private readonly model: Prisma.PatientProfileDelegate;

    constructor(
        private readonly _prisma: PrismaClient,
        private readonly mapper: PatientMapper,
        private readonly dateTimeService: IDateTimeService
    ) {

        this.model = this._prisma.patientProfile;
    }

    async findById(id: string): Promise<Patient | null> {
        const result = await this._prisma.patientProfile.findUnique({
            where: { id },
            include: {
                user: true,
                emergencyContacts: true,
                wallet: true
            }
        });
        return result ? this.mapper.toDomain(result) : null;
    }

    async updatePatient(id: string, data: Partial<PatientProfile>): Promise<Patient> {
        const result = await this._prisma.patientProfile.update({
            where: { id },
            data: {
                firstName: data.firstName,
                lastName: data.lastName,
                phone: data.phone,
                bloodGroup: data.bloodGroup,
                gender: data.gender,
                dob: data.dob,
                avatarUrl: data.avatarUrl
            },
            include: { user: true, emergencyContacts: true }
        });
        return this.mapper.toDomain(result)!;
    }

    async updatePassword(id: string, passwordHash: string): Promise<void> {
        await this._prisma.user.update({
            where: { id: id },
            data: { passwordHash }
        });
    }

    async replaceEmergencyContacts(patientId: string, contacts: EmergencyContact[]): Promise<void> {
        await this._prisma.$transaction([
            this._prisma.emergencyContact.deleteMany({
                where: { patientId }
            }),
            this._prisma.emergencyContact.createMany({
                data: contacts.map(c => ({
                    name: c.name,
                    mobile: c.mobile,
                    patientId
                }))
            })
        ]);
    }

    async getPatients(query: PatientFilters): Promise<PaginatedPatients> {
        const { search, status, gender, page = 1, limit = 10, sortBy = 'firstName', sortOrder = 'asc' } = query;
        const skip = (page - 1) * limit;

        const where: Prisma.PatientProfileWhereInput = {
            user: {
                deletedAt: null,
                role: { not: 'ADMIN' }
            }
        };

        if (status && where.user) {
            where.user.status = status;
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

        // Define valid fields for sorting to prevent injection
        const validSortFields = ['firstName', 'lastName', 'createdAt', 'patientId'];
        const orderByField = validSortFields.includes(sortBy) ? sortBy : 'firstName';

        const [patients, total] = await Promise.all([
            this._prisma.patientProfile.findMany({
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
                    [orderByField]: sortOrder
                }
            }),
            this._prisma.patientProfile.count({ where })
        ]);

        return {
            data: patients.map(p => this.mapper.toListItem(p as PrismaPatientWithUser & { _count?: { appointments: number } })!).filter(Boolean),
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    async toggleBlock(userId: string, status: UserStatus): Promise<void> {
        await this._prisma.user.update({
            where: { id: userId },
            data: { status: status as PrismaUserStatus }
        });
    }

    async deletePatient(userId: string): Promise<void> {
        await this._prisma.user.update({
            where: { id: userId },
            data: {
                deletedAt: this.dateTimeService.now(),
                status: PrismaUserStatus.INACTIVE
            }
        });
    }

    async getStats(): Promise<{ total: number; active: number; blocked: number }> {
        const [total, active, blocked] = await Promise.all([
            this._prisma.patientProfile.count({
                where: { user: { deletedAt: null } }
            }),
            this._prisma.patientProfile.count({
                where: { user: { status: PrismaUserStatus.ACTIVE, deletedAt: null } }
            }),
            this._prisma.patientProfile.count({
                where: { user: { status: PrismaUserStatus.INACTIVE, deletedAt: null } }
            })
        ]);

        return { total, active, blocked };
    }
}
