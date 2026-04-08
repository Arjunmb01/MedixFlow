import { PrismaClient, ConsultationStatus, Consultation, Prisma } from "@prisma/client";
import { IDateTimeService } from "@/domain/services/IDateTimeService";
import { 
    IConsultationRepository, 
    CreateConsultationDTO,
    ConsultationRecord,
    SaveVitalsDTO,
    SaveMedicalRecordDTO,
    SavePrescriptionDTO,
    ConsultationWithDetails,
    ConsultationQueueItem,
    ConsultationWithEMR,
    ConsultationHistoryItem
} from "../../domain/repositories/IConsultationRepository";

import { 
    ConsultationMapper, 
    PrismaConsultationWithDetails, 
    PrismaConsultationQueueItem, 
    PrismaConsultationWithEMR 
} from "../database/mappers/ConsultationMapper";

export class ConsultationRepository implements IConsultationRepository {
    constructor(
        private readonly prisma: PrismaClient,
        private readonly mapper: ConsultationMapper,
        private readonly dateTimeService: IDateTimeService
    ) {}

    async create(data: CreateConsultationDTO): Promise<ConsultationRecord> {
        const result = await this.prisma.consultation.create({
            data: {
                ...data,
                status: "WAITING"
            }
        });
        return this.mapper.toRecord(result);
    }

    async findById(id: string): Promise<ConsultationWithDetails | null> {
        const result = await this.prisma.consultation.findUnique({
            where: { id },
            include: {
                patient: true,
                doctor: {
                    include: {
                        specialization: true
                    }
                },
                vitals: {
                    orderBy: { id: "desc" }
                },
                medicalRecord: true,
                prescription: {
                    include: {
                        medicines: true
                    }
                },
                appointment: true
            }
        });
        return result ? this.mapper.toWithDetails(result as PrismaConsultationWithDetails) : null;
    }

    async findByAppointmentId(appointmentId: string): Promise<ConsultationWithEMR | null> {
        const result = await this.prisma.consultation.findUnique({
            where: { appointmentId },
            include: {
                vitals: true,
                medicalRecord: true,
                prescription: {
                    include: {
                        medicines: true
                    }
                }
            }
        });
        return result ? this.mapper.toWithEMR(result as PrismaConsultationWithEMR) : null;
    }

    async getDoctorQueue(doctorId: string, date: Date): Promise<ConsultationQueueItem[]> {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const results = await this.prisma.consultation.findMany({
            where: {
                doctorId,
                status: {
                    in: ["WAITING", "IN_PROGRESS", "COMPLETED"]
                },
                appointment: {
                    appointmentDate : {
                        gte : startOfDay,
                        lte : endOfDay
                    },
                    status : {
                        in : ["CONFIRMED", "COMPLETED"]
                    }
                }
            },
            include: {
                patient: true,
                appointment: true
            },
            orderBy: {
                appointment : {
                    slotStart: "asc"
                }
            }
        });
        return results.map(r => this.mapper.toQueueItem(r as PrismaConsultationQueueItem))
        .filter((item): item is ConsultationQueueItem => item !== null);
    }

    async updateStatus(id: string, status: ConsultationStatus | string): Promise<ConsultationRecord> {
        const updateData: Prisma.ConsultationUpdateInput = { status: status as ConsultationStatus };
        if (status === "IN_PROGRESS") {
            updateData.startedAt = this.dateTimeService.now();
        } else if (status === "COMPLETED") {
            updateData.completedAt = this.dateTimeService.now();
        }

        const result = await this.prisma.consultation.update({
            where: { id },
            data: updateData
        });
        return this.mapper.toRecord(result);
    }

    async saveConsultationData(
        id: string,
        vitals?: SaveVitalsDTO,
        medicalRecord?: SaveMedicalRecordDTO,
        prescription?: SavePrescriptionDTO
    ): Promise<ConsultationWithEMR> {
        return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {

            if (vitals) {
                await tx.vitals.create({
                    data: {
                        consultationId: id,
                        ...vitals
                    }
                });
            }

            // Medical Record (upsert)
            if (medicalRecord) {
                await tx.medicalRecord.upsert({
                    where: { consultationId: id },
                    create: {
                        consultationId: id,
                        ...medicalRecord
                    },
                    update: {
                        ...medicalRecord
                    }
                });
            }

            // Prescription (upsert + replace medicines)
            if (prescription) {
                const existingRx = await tx.prescription.findUnique({
                    where: { consultationId: id }
                });

                if (existingRx) {
                    await tx.medicine.deleteMany({
                        where: { prescriptionId: existingRx.id }
                    });
                    await tx.prescription.update({
                        where: { id: existingRx.id },
                        data: {
                            instructions: prescription.instructions,
                            medicines: {
                                create: prescription.medicines
                            }
                        }
                    });
                } else {
                    await tx.prescription.create({
                        data: {
                            consultationId: id,
                            instructions: prescription.instructions,
                            medicines: {
                                create: prescription.medicines
                            }
                        }
                    });
                }
            }

            const result: ConsultationWithEMR | null = await tx.consultation.findUnique({
                where: { id },
                include: {
                    vitals: true,
                    medicalRecord: true,
                    prescription: { include: { medicines: true } }
                }
            });

            if (!result) {
                throw new Error("Consultation not found after save");
            }

            return this.mapper.toWithEMR(result as PrismaConsultationWithEMR);
        });
    }

    async getPatientHistory(patientId: string): Promise<ConsultationHistoryItem[]> {
        const results = await this.prisma.consultation.findMany({
            where: {
                patientId,
                status: "COMPLETED"
            },
            include: {
                patient: true,
                vitals: true,
                medicalRecord: true,
                prescription: {
                    include: {
                        medicines: true
                    }
                },
                appointment: true,
                doctor: {
                    include: {
                        specialization: true
                    }
                }
            },
            orderBy: {
                completedAt: "desc"
            }
        });
        return results.map(r => this.mapper.toHistoryItem(r as PrismaConsultationWithDetails));
    }

    async deleteByAppointmentId(appointmentId: string): Promise<void> {
        await this.prisma.consultation.deleteMany({
            where: { appointmentId }
        });
    }
}