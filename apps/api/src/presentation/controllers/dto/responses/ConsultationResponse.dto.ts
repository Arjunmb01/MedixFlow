import { ConsultationStatus } from "../../../../domain/value-objects/enums/ConsultationStatus";

export interface ConsultationResponseDTO {
    id: string;
    appointmentId: string;
    doctorId: string;
    patientId: string;
    status: ConsultationStatus | string;
    createdAt: Date;
    startedAt?: Date | null;
    completedAt?: Date | null;
    vitals: Array<{
        bloodPressure?: string | null;
        heartRate?: number | null;
        temperature?: number | null;
        weight?: number | null;
    }>;
    medicalRecord: {
        symptoms: string;
        diagnosis: string;
        notes?: string | null;
    } | null;
    prescription: {
        id: string;
        instructions?: string | null;
        medicines: Array<{
            name: string;
            dosage: string;
            frequency: string;
            duration: string;
        }>;
    } | null;
    patient: {
        id: string;
        firstName: string;
        lastName: string;
    };
    doctor: {
        id: string;
        firstName: string;
        lastName: string;
        specialty: string;
    };
}

export class ConsultationResponseMapper {
    static toResponse(domain: any): ConsultationResponseDTO {
        return {
            id: domain.id,
            appointmentId: domain.appointmentId,
            doctorId: domain.doctorId,
            patientId: domain.patientId,
            status: domain.status,
            createdAt: domain.createdAt,
            startedAt: domain.startedAt,
            completedAt: domain.completedAt,
            vitals: domain.vitals.map((v: any) => ({
                bloodPressure: v.bloodPressure,
                heartRate: v.heartRate,
                temperature: v.temperature,
                weight: v.weight,
            })),
            medicalRecord: domain.medicalRecord ? {
                symptoms: domain.medicalRecord.symptoms,
                diagnosis: domain.medicalRecord.diagnosis,
                notes: domain.medicalRecord.notes,
            } : null,
            prescription: domain.prescription ? {
                id: domain.prescription.id,
                instructions: domain.prescription.instructions,
                medicines: domain.prescription.medicines.map((m: any) => ({
                    name: m.name,
                    dosage: m.dosage,
                    frequency: m.frequency,
                    duration: m.duration,
                })),
            } : null,
            patient: {
                id: domain.patient.id,
                firstName: domain.patient.firstName,
                lastName: domain.patient.lastName,
            },
            doctor: {
                id: domain.doctor.id,
                firstName: domain.doctor.firstName,
                lastName: domain.doctor.lastName,
                specialty: domain.doctor.specialization?.name || "General",
            }
        };
    }
}
