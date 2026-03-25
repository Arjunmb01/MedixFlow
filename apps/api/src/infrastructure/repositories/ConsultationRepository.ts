import { PrismaClient, ConsultationStatus, Consultation } from "@prisma/client";
import { 
    IConsultationRepository, 
    CreateConsultationDTO,
    SaveVitalsDTO,
    SaveMedicalRecordDTO,
    SavePrescriptionDTO,
    ConsultationWithDetails,
    ConsultationQueueItem,
    ConsultationWithEMR,
    ConsultationHistoryItem
} from "../../domain/repositories/IConsultationRepository";

export class ConsultationRepository implements IConsultationRepository {
    constructor(private readonly prisma: PrismaClient) {}

    async create(data: CreateConsultationDTO): Promise<Consultation> {
        return this.prisma.consultation.create({
            data: {
                ...data,
                status: "WAITING"
            }
        });
    }

    async findById(id: string): Promise<ConsultationWithDetails | null> {
        return this.prisma.consultation.findUnique({
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
    }

    async findByAppointmentId(appointmentId: string): Promise<ConsultationWithEMR | null> {
        return this.prisma.consultation.findUnique({
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
    }

    async getDoctorQueue(doctorId: string, date: Date): Promise<ConsultationQueueItem[]> {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        return this.prisma.consultation.findMany({
            where: {
                doctorId,
                createdAt: {
                    gte: startOfDay,
                    lte: endOfDay
                },
                status: {
                    in: ["WAITING", "IN_PROGRESS"]
                }
            },
            include: {
                patient: true,
                appointment: true
            },
            orderBy: {
                createdAt: "asc" // FIFO
            }
        });
    }

    async updateStatus(id: string, status: ConsultationStatus): Promise<Consultation> {
        const data: any = { status };
        if (status === "IN_PROGRESS") {
            data.startedAt = new Date();
        } else if (status === "COMPLETED") {
            data.completedAt = new Date();
        }

        return this.prisma.consultation.update({
            where: { id },
            data
        });
    }

    async saveConsultationData(
        id: string,
        vitals?: SaveVitalsDTO,
        medicalRecord?: SaveMedicalRecordDTO,
        prescription?: SavePrescriptionDTO
    ): Promise<Consultation> {
        return this.prisma.$transaction(async (tx) => {
            // Vitals (create new entry)
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

            return tx.consultation.findUnique({
                where: { id },
                include: {
                    vitals: true,
                    medicalRecord: true,
                    prescription: { include: { medicines: true } }
                }
            }) as Promise<Consultation>;
        });
    }

    async getPatientHistory(patientId: string): Promise<ConsultationHistoryItem[]> {
        return this.prisma.consultation.findMany({
            where: {
                patientId,
                status: "COMPLETED"
            },
            include: {
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
    }
}