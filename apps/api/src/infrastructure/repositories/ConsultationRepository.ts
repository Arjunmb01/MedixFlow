import { PrismaClient, ConsultationStatus, Consultation, Prisma, LabTestUrgency } from "@prisma/client";
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
    ConsultationHistoryItem,
    LabTestRequestDTO,
    ConsultationDraftDTO,
    LabTestRecord
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
                appointmentId: data.appointmentId,
                doctorId: data.doctorId,
                patientId: data.patientId,
                parentConsultationId: data.parentConsultationId,
                followUpExpiry: data.followUpExpiry,
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
                labTests: {
                    include: {
                        reports: true
                    }
                },
                followUp: true,
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
                },
                labTests: {
                    include: {
                        reports: true
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
                        in : ["BOOKED", "COMPLETED"]
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
        prescription?: SavePrescriptionDTO,
        userId?: string
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

            // Revision tracking
            if (userId) {
                await tx.consultationRevision.create({
                    data: {
                        consultationId: id,
                        revisedBy: userId,
                        vitals: vitals as any,
                        medicalRecord: medicalRecord as any,
                        prescription: prescription as any
                    }
                });
            }

            // Delete draft upon finalization
            await tx.consultationDraft.deleteMany({
                where: { consultationId: id }
            });

            const result = await tx.consultation.findUnique({
                where: { id },
                include: {
                    vitals: true,
                    medicalRecord: true,
                    prescription: { include: { medicines: true } },
                    labTests: {
                        include: {
                            reports: true
                        }
                    }
                }
            });

            if (!result) {
                throw new Error("Consultation not found after save");
            }

            return this.mapper.toWithEMR(result as any);
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
                labTests: {
                    include: {
                        reports: true
                    }
                },
                appointment: true,
                followUp: true,
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

    async requestLabTests(consultationId: string, tests: LabTestRequestDTO[]): Promise<void> {
        await this.prisma.labTest.createMany({
            data: tests.map(test => ({
                consultationId,
                testName: test.testName,
                testType: test.testType,
                instructions: test.instructions,
                fastingRequired: test.fastingRequired,
                urgency: (test.urgency as LabTestUrgency) || "NORMAL",
                status: "PENDING"
            }))
        });
    }

    async getLabTestsByConsultation(consultationId: string): Promise<LabTestRecord[]> {
        const results = await this.prisma.labTest.findMany({
            where: { consultationId },
            include: { reports: true },
            orderBy: { createdAt: "asc" }
        });
        return results.map(l => ({
            ...l,
            urgency: l.urgency as any,
            status: l.status as any,
            reports: l.reports.map(r => ({
                ...r,
                fileType: r.fileType ?? null
            }))
        }));
    }

    async uploadLabTestReport(labTestId: string, reportUrl: string): Promise<void> {
        await this.prisma.labTest.update({
            where: { id: labTestId },
            data: {
                status: "UPLOADED",
                reports: {
                    create: {
                        fileUrl: reportUrl,
                        fileName: "Diagnostic Report",
                    }
                }
            }
        });
    }

    async reviewLabTest(labTestId: string, doctorId: string, comments?: string, isAbnormal?: boolean): Promise<void> {
        await this.prisma.labTest.update({
            where: { id: labTestId },
            data: {
                status: "REVIEWED",
                reviewedBy: doctorId,
                reviewerComments: comments,
                isAbnormal: isAbnormal ?? false
            }
        });
    }

    async updateLabTestStatus(labTestId: string, status: 'PENDING' | 'UPLOADED' | 'REVIEWED'): Promise<void> {
        await this.prisma.labTest.update({
            where: { id: labTestId },
            data: { status: status as any }
        });
    }

    async saveDraft(consultationId: string, draft: ConsultationDraftDTO): Promise<void> {
        await this.prisma.consultationDraft.upsert({
            where: { consultationId },
            create: {
                consultationId,
                vitals: draft.vitals as any,
                medicalRecord: draft.medicalRecord as any,
                prescription: draft.prescription as any,
                labTests: draft.labTests as any
            },
            update: {
                vitals: draft.vitals as any,
                medicalRecord: draft.medicalRecord as any,
                prescription: draft.prescription as any,
                labTests: draft.labTests as any
            }
        });
    }

    async getDraft(consultationId: string): Promise<ConsultationDraftDTO | null> {
        const draft = await this.prisma.consultationDraft.findUnique({
            where: { consultationId }
        });
        if (!draft) return null;
        return {
            vitals: draft.vitals,
            medicalRecord: draft.medicalRecord,
            prescription: draft.prescription,
            labTests: draft.labTests
        };
    }

    async deleteDraft(consultationId: string): Promise<void> {
        await this.prisma.consultationDraft.deleteMany({
            where: { consultationId }
        });
    }

    async getRevisions(consultationId: string): Promise<any[]> {
        return this.prisma.consultationRevision.findMany({
            where: { consultationId },
            orderBy: { createdAt: "desc" }
        });
    }

    // FollowUp methods
    async scheduleFollowUp(data: any): Promise<any> {
        const result = await this.prisma.followUp.create({
            data: {
                consultationId: data.consultationId,
                patientId: data.patientId,
                doctorId: data.doctorId,
                scheduledDate: data.scheduledDate,
                time: data.time,
                type: data.type,
                reason: data.reason,
                notes: data.notes,
                status: "SCHEDULED"
            }
        });
        return result as any;
    }

    async getFollowUpByConsultation(consultationId: string): Promise<any | null> {
        return this.prisma.followUp.findUnique({
            where: { consultationId }
        });
    }

    async getPatientFollowUps(patientId: string): Promise<any[]> {
        return this.prisma.followUp.findMany({
            where: { patientId },
            orderBy: { scheduledDate: "asc" }
        });
    }

    async updateFollowUpStatus(id: string, status: string): Promise<any> {
        return this.prisma.followUp.update({
            where: { id },
            data: { status: status as any }
        });
    }
}
