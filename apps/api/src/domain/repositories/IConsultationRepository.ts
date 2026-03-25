import { Consultation, ConsultationStatus, Prisma } from "@prisma/client";

export interface CreateConsultationDTO {
    appointmentId: string;
    doctorId: string;
    patientId: string;
}

export interface SaveVitalsDTO {
    bloodPressure?: string;
    heartRate?: number;
    temperature?: number;
    weight?: number;
}

export interface SaveMedicalRecordDTO {
    symptoms: string;
    diagnosis: string;
    notes?: string;
}

export interface MedicineDTO {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
}

export interface SavePrescriptionDTO {
    instructions?: string;
    medicines: MedicineDTO[];
}

// Typed return for consultation with full relations
export type ConsultationWithDetails = Prisma.ConsultationGetPayload<{
    include: {
        patient: true;
        doctor: { include: { specialization: true } };
        vitals: true;
        medicalRecord: true;
        prescription: { include: { medicines: true } };
        appointment: true;
    };
}>;

export type ConsultationQueueItem = Prisma.ConsultationGetPayload<{
    include: {
        patient: true;
        appointment: true;
    };
}>;

export type ConsultationHistoryItem = Prisma.ConsultationGetPayload<{
    include: {
        vitals: true;
        medicalRecord: true;
        prescription: { include: { medicines: true } };
        appointment: true;
        doctor: { include: { specialization: true } };
    };
}>;

export type ConsultationWithEMR = Prisma.ConsultationGetPayload<{
    include: {
        vitals: true;
        medicalRecord: true;
        prescription: { include: { medicines: true } };
    };
}>;

export interface IConsultationRepository {
    create(data: CreateConsultationDTO): Promise<Consultation>;
    findById(id: string): Promise<ConsultationWithDetails | null>;
    findByAppointmentId(appointmentId: string): Promise<ConsultationWithEMR | null>;
    getDoctorQueue(doctorId: string, date: Date): Promise<ConsultationQueueItem[]>;
    updateStatus(id: string, status: ConsultationStatus): Promise<Consultation>;
    saveConsultationData(
        id: string,
        vitals?: SaveVitalsDTO,
        medicalRecord?: SaveMedicalRecordDTO,
        prescription?: SavePrescriptionDTO
    ): Promise<Consultation>;
    getPatientHistory(patientId: string): Promise<ConsultationHistoryItem[]>;
}