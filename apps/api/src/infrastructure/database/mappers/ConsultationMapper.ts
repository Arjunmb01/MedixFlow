import {
    Consultation,
    PatientProfile,
    DoctorProfile,
    Specialization,
    Appointment,
    Vitals,
    MedicalRecord,
    Prescription,
    Medicine,
    LabTest
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
    labTests: LabTest[];
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
    labTests: LabTest[];
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
                planForManagement: prismaCons.medicalRecord.planForManagement,
            } : null,
            prescription: prismaCons.prescription ? {
                id: prismaCons.prescription.id,
                instructions: prismaCons.prescription.instructions,
                medicines: prismaCons.prescription.medicines.map(m => ({
                    name: m.name,
                    dosage: m.dosage,
                    frequency: m.frequency,
                    duration: m.duration,
                    instructions: m.instructions ?? undefined,
                })),
            } : null,
            labTests: prismaCons.labTests.map(l => ({
                id: l.id,
                consultationId: l.consultationId,
                testName: l.testName,
                status: l.status as any,
                reportUrl: l.reportUrl,
                createdAt: l.createdAt,
                updatedAt: l.updatedAt,
            })),
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
                planForManagement: prismaCons.medicalRecord.planForManagement,
            } : null,
            prescription: prismaCons.prescription ? {
                id: prismaCons.prescription.id,
                instructions: prismaCons.prescription.instructions,
                medicines: prismaCons.prescription.medicines.map(m => ({
                    name: m.name,
                    dosage: m.dosage,
                    frequency: m.frequency,
                    duration: m.duration,
                    instructions: m.instructions ?? undefined,
                })),
            } : null,
            labTests: prismaCons.labTests.map(l => ({
                id: l.id,
                consultationId: l.consultationId,
                testName: l.testName,
                status: l.status as any,
                reportUrl: l.reportUrl,
                createdAt: l.createdAt,
            updatedAt: l.updatedAt,
            })),
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
