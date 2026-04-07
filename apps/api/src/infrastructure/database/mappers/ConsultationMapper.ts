import {
    Consultation,
    PatientProfile,
    DoctorProfile,
    Specialization,
    Appointment,
    Vitals,
    MedicalRecord,
    Prescription,
    Medicine
} from "@prisma/client";
import {
    ConsultationRecord,
    ConsultationWithDetails,
    ConsultationQueueItem,
    ConsultationWithEMR,
    ConsultationHistoryItem
} from "../../../domain/repositories/IConsultationRepository";

export type PrismaConsultationWithDetails = Consultation & {
    patient: PatientProfile;
    doctor: DoctorProfile & { specialization: Specialization | null };
    vitals: Vitals[];
    medicalRecord: MedicalRecord | null;
    prescription: (Prescription & { medicines: Medicine[] }) | null;
    appointment: Appointment;
};

export type PrismaConsultationQueueItem = Consultation & {
    patient: PatientProfile;
    appointment: Appointment;
};

export type PrismaConsultationWithEMR = Consultation & {
    vitals: Vitals[];
    medicalRecord: MedicalRecord | null;
    prescription: (Prescription & { medicines: Medicine[] }) | null;
};

export class ConsultationMapper {
    toRecord(prismaCons: Consultation): ConsultationRecord {
        return {
            id: prismaCons.id,
            appointmentId: prismaCons.appointmentId,
            doctorId: prismaCons.doctorId,
            patientId: prismaCons.patientId,
            status: prismaCons.status,
            createdAt: prismaCons.createdAt,
            startedAt: prismaCons.startedAt,
            completedAt: prismaCons.completedAt,
        };
    }

    toWithDetails(prismaCons: PrismaConsultationWithDetails): ConsultationWithDetails {
        return {
            ...this.toRecord(prismaCons),
            patient: {
                id: prismaCons.patient.id,
                firstName: prismaCons.patient.firstName,
                lastName: prismaCons.patient.lastName,
                phone: prismaCons.patient.phone,
            },
            doctor: {
                id: prismaCons.doctor.id,
                firstName: prismaCons.doctor.firstName,
                lastName: prismaCons.doctor.lastName,
                specialization: prismaCons.doctor.specialization ? { name: prismaCons.doctor.specialization.name } : null,
            },
            vitals: prismaCons.vitals.map(v => ({
                bloodPressure: v.bloodPressure,
                heartRate: v.heartRate,
                temperature: v.temperature,
                weight: v.weight,
            })),
            medicalRecord: prismaCons.medicalRecord ? {
                symptoms: prismaCons.medicalRecord.symptoms,
                diagnosis: prismaCons.medicalRecord.diagnosis,
                notes: prismaCons.medicalRecord.notes,
            } : null,
            prescription: prismaCons.prescription ? {
                id: prismaCons.prescription.id,
                instructions: prismaCons.prescription.instructions,
                medicines: prismaCons.prescription.medicines.map(m => ({
                    name: m.name,
                    dosage: m.dosage,
                    frequency: m.frequency,
                    duration: m.duration,
                })),
            } : null,
            appointment: {
                id: prismaCons.appointment.id,
                appointmentDate: prismaCons.appointment.appointmentDate,
                slotStart: prismaCons.appointment.slotStart,
                slotEnd: prismaCons.appointment.slotEnd,
            }
        };
    }

    toWithEMR(prismaCons: PrismaConsultationWithEMR): ConsultationWithEMR {
        if (!prismaCons) {
            throw new Error("Invalid consultation data");
        }
        return {
            ...this.toRecord(prismaCons),
            vitals: prismaCons.vitals.map(v => ({
                bloodPressure: v.bloodPressure,
                heartRate: v.heartRate,
                temperature: v.temperature,
                weight: v.weight,
            })),
            medicalRecord: prismaCons.medicalRecord ? {
                symptoms: prismaCons.medicalRecord.symptoms,
                diagnosis: prismaCons.medicalRecord.diagnosis,
                notes: prismaCons.medicalRecord.notes,
            } : null,
            prescription: prismaCons.prescription ? {
                id: prismaCons.prescription.id,
                instructions: prismaCons.prescription.instructions,
                medicines: prismaCons.prescription.medicines.map(m => ({
                    name: m.name,
                    dosage: m.dosage,
                    frequency: m.frequency,
                    duration: m.duration,
                })),
            } : null,
        };
    }

    toQueueItem(prismaCons: PrismaConsultationQueueItem): ConsultationQueueItem {
        if (!prismaCons) {
            throw new Error("Invalid consultation data");
        }

        return {
            ...this.toRecord(prismaCons),
            patient: {
                id: prismaCons.patient.id,
                firstName: prismaCons.patient.firstName,
                lastName: prismaCons.patient.lastName,
            },
            appointment: {
                id: prismaCons.appointment.id,
                appointmentDate: prismaCons.appointment.appointmentDate,
                slotStart: prismaCons.appointment.slotStart,
                slotEnd: prismaCons.appointment.slotEnd,
            }
        };
    }

    toHistoryItem(prismaCons: PrismaConsultationWithDetails): ConsultationHistoryItem {
        const mapped = this.toWithDetails(prismaCons)

        return {
            ...mapped,
        }
    }
}
