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
    LabTest,
    LabReport,
    FollowUp,
    FoodTiming,
    MedicineType
} from "@prisma/client";
import {
    ConsultationRecord,
    ConsultationWithDetails,
    ConsultationQueueItem,
    ConsultationWithEMR,
    ConsultationHistoryItem,
    LabReportRecord,
    FollowUpRecord
} from "../../../domain/repositories/IConsultationRepository";

export type PrismaConsultationWithDetails = Consultation & {
    patient: PatientProfile;
    doctor: DoctorProfile & { specialization: Specialization | null };
    vitals: Vitals[];
    medicalRecord: MedicalRecord | null;
    prescription: (Prescription & { medicines: Medicine[] }) | null;
    labTests: (LabTest & { reports: LabReport[] })[];
    followUp: FollowUp | null;
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
    labTests: (LabTest & { reports: LabReport[] })[];
};

export class ConsultationMapper {
    toRecord(prismaCons: Consultation): ConsultationRecord {
        return {
            id: prismaCons.id,
            appointmentId: prismaCons.appointmentId,
            doctorId: prismaCons.doctorId,
            patientId: prismaCons.patientId,
            status: prismaCons.status,
            parentConsultationId: prismaCons.parentConsultationId,
            followUpExpiry: prismaCons.followUpExpiry,
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
                patientId: prismaCons.patient.patientId,
                phone: prismaCons.patient.phone,
                dob: prismaCons.patient.dob ?? undefined,
                gender: prismaCons.patient.gender ?? undefined,
                bloodGroup: prismaCons.patient.bloodGroup ?? undefined,
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
                    genericName: m.genericName ?? undefined,
                    dosage: m.dosage,
                    frequency: m.frequency,
                    morning: m.morning,
                    afternoon: m.afternoon,
                    night: m.night,
                    duration: m.duration,
                    foodTiming: m.foodTiming as any,
                    instructions: m.instructions ?? undefined,
                    type: m.type as any,
                })),
            } : null,
            labTests: prismaCons.labTests.map(l => ({
                id: l.id,
                consultationId: l.consultationId,
                testName: l.testName,
                testType: l.testType,
                instructions: l.instructions,
                fastingRequired: l.fastingRequired,
                urgency: l.urgency as any,
                status: l.status as any,
                assignedBy: l.assignedBy,
                reviewedBy: l.reviewedBy,
                reviewerComments: l.reviewerComments,
                isAbnormal: l.isAbnormal,
                reports: l.reports.map(r => ({
                    id: r.id,
                    labTestId: r.labTestId,
                    fileUrl: r.fileUrl,
                    fileName: r.fileName,
                    fileType: r.fileType,
                    uploadedAt: r.uploadedAt,
                })),
                createdAt: l.createdAt,
                updatedAt: l.updatedAt,
            })),
            followUp: prismaCons.followUp ? {
                id: prismaCons.followUp.id,
                consultationId: prismaCons.followUp.consultationId,
                patientId: prismaCons.followUp.patientId,
                doctorId: prismaCons.followUp.doctorId,
                scheduledDate: prismaCons.followUp.scheduledDate,
                time: prismaCons.followUp.time,
                type: prismaCons.followUp.type as any,
                status: prismaCons.followUp.status as any,
                reason: prismaCons.followUp.reason,
                notes: prismaCons.followUp.notes,
                createdAt: prismaCons.followUp.createdAt,
                updatedAt: prismaCons.followUp.updatedAt,
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
                planForManagement: prismaCons.medicalRecord.planForManagement,
            } : null,
            prescription: prismaCons.prescription ? {
                id: prismaCons.prescription.id,
                instructions: prismaCons.prescription.instructions,
                medicines: prismaCons.prescription.medicines.map(m => ({
                    name: m.name,
                    genericName: m.genericName ?? undefined,
                    dosage: m.dosage,
                    frequency: m.frequency,
                    morning: m.morning,
                    afternoon: m.afternoon,
                    night: m.night,
                    duration: m.duration,
                    foodTiming: m.foodTiming as any,
                    instructions: m.instructions ?? undefined,
                    type: m.type as any,
                })),
            } : null,
            labTests: prismaCons.labTests.map(l => ({
                id: l.id,
                consultationId: l.consultationId,
                testName: l.testName,
                testType: l.testType,
                instructions: l.instructions,
                fastingRequired: l.fastingRequired,
                urgency: l.urgency as any,
                status: l.status as any,
                assignedBy: l.assignedBy,
                reviewedBy: l.reviewedBy,
                reviewerComments: l.reviewerComments,
                isAbnormal: l.isAbnormal,
                reports: l.reports.map(r => ({
                    id: r.id,
                    labTestId: r.labTestId,
                    fileUrl: r.fileUrl,
                    fileName: r.fileName,
                    fileType: r.fileType,
                    uploadedAt: r.uploadedAt,
                })),
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
                patientId: prismaCons.patient.patientId,
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
