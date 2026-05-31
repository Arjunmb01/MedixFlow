import { Appointment, PatientProfile, DoctorProfile, Specialization, Consultation, MedicalRecord, Prescription, Medicine, Vitals } from "@prisma/client";
import { 
    AppointmentRecord, 
    AppointmentWithDoctor, 
    AppointmentWithConsultation, 
    AppointmentWithPatient, 
    AppointmentWithDoctorAndPatient, 
    AppointmentPreview 
} from "../../../domain/repositories/IAppointmentRepository";
import { Prisma } from "@prisma/client";
import { AppointmentStatus as PrismaAppointmentstatus } from "@prisma/client";
import { AppointmentStatus as DomainAppointmentStatus } from "../../../domain/value-objects/enums/AppointmentStatus";

type PrismaAppointmentWithDoctor = Prisma.AppointmentGetPayload<{
    include: {
        doctor: {
            include: { specialization: true }
        }
    }
}>;

type PrismaAppointmentWithConsultation = Prisma.AppointmentGetPayload<{
    include: {
        doctor: {
            include: { specialization: true }
        },
        consultation: {
            include: {
                medicalRecord: true,
                prescription: {
                    include: { medicines: true }
                },
                vitals: true
            }
        }
    }
}>;

type PrismaAppointmentWithPatient = Prisma.AppointmentGetPayload<{
    include: { 
        patient: {
            include: { user: true }
        },
        consultation: {
            include: {
                prescription: {
                    include: { medicines: true }
                }
            }
        }
    }
}>;

type PrismaAppointmentWithDoctorAndPatient = Prisma.AppointmentGetPayload<{
    include: {
        doctor: {
            include: { specialization: true }
        },
        patient: {
            include: { user: true }
        },
        payment: true,
        consultation: {
            include: {
                medicalRecord: true,
                prescription: {
                    include: { medicines: true }
                },
                vitals: true
            }
        }
    }
}>;

type PrismaAppointmentPreview = Prisma.AppointmentGetPayload<{
    include: {
        patient: {
            include: { user: true }
        },
        doctor: {
            include: { specialization: true }
        },
        payment: true
    }
}>;

type PrismaAppointmentWithPayment = Prisma.AppointmentGetPayload<{
    include: { payment: true }
}>;

export class AppointmentMapper {
    toRecord(prismaApp: Appointment & { payment?: { amount: number; razorpayPaymentId?: string | null; id: string } | null }): AppointmentRecord {
        return {
            id: prismaApp.id,
            patientId: prismaApp.patientId,
            doctorId: prismaApp.doctorId,
            appointmentDate: prismaApp.appointmentDate,
            slotStart: prismaApp.slotStart,
            slotEnd: prismaApp.slotEnd,
            startTime: prismaApp.startTime,
            endTime: prismaApp.endTime,
            status: prismaApp.status,
            consultationType: (prismaApp as { consultationType?: "VIDEO" | "CLINIC" }).consultationType,
            paymentStatus: prismaApp.paymentStatus || undefined,
            paymentMethod: prismaApp.paymentStatus ? (prismaApp.paymentMethod || undefined) : undefined,
            reason: prismaApp.reason,
            notes: prismaApp.notes,
            paymentAmount: prismaApp.payment?.amount,
            transactionId: prismaApp.payment?.razorpayPaymentId || prismaApp.payment?.id,
            queueNumber: prismaApp.queueNumber,
            createdAt: prismaApp.createdAt,
            rescheduledToId: prismaApp.rescheduledToId,
            lastStatusChangedAt: prismaApp.lastStatusChangedAt,
            parentAppointmentId: prismaApp.parentAppointmentId,
        };
    }

    toWithDoctor(prismaApp: PrismaAppointmentWithDoctor): AppointmentWithDoctor {
        return {
            ...this.toRecord(prismaApp),
            doctor: {
                id: prismaApp.doctor.id,
                firstName: prismaApp.doctor.firstName,
                lastName: prismaApp.doctor.lastName,
                specialization: prismaApp.doctor.specialization ? { name: prismaApp.doctor.specialization.name } : null,
            }
        };
    }

    toWithConsultation(prismaApp: PrismaAppointmentWithConsultation): AppointmentWithConsultation {
        return {
            ...this.toWithDoctor(prismaApp),
            consultation: prismaApp.consultation ? {
                id: prismaApp.consultation.id,
                status: prismaApp.consultation.status,
                vitals: prismaApp.consultation.vitals.map(v => ({
                    bloodPressure: v.bloodPressure,
                    heartRate: v.heartRate,
                    temperature: v.temperature,
                    weight: v.weight,
                })),
                medicalRecord: prismaApp.consultation.medicalRecord ? {
                    symptoms: prismaApp.consultation.medicalRecord.symptoms,
                    diagnosis: prismaApp.consultation.medicalRecord.diagnosis,
                    notes: prismaApp.consultation.medicalRecord.notes,
                    planForManagement: prismaApp.consultation.medicalRecord.planForManagement,
                } : null,
                prescription: prismaApp.consultation.prescription ? {
                    id: prismaApp.consultation.prescription.id,
                    instructions: prismaApp.consultation.prescription.instructions,
                    medicines: prismaApp.consultation.prescription.medicines.map(m => ({
                        id: m.id,
                        name: m.name,
                        dosage: m.dosage,
                        frequency: m.frequency,
                        duration: m.duration,
                        instructions: m.instructions,
                    })),
                } : null,
            } : null,
        };
    }

    toWithPatient(prismaApp: PrismaAppointmentWithPatient): AppointmentWithPatient {
        return {
            ...this.toRecord(prismaApp),
            patient: {
                id: prismaApp.patient.id,
                patientId: prismaApp.patient.patientId,
                firstName: prismaApp.patient.firstName,
                lastName: prismaApp.patient.lastName,
                email: prismaApp.patient.user.email,
                phone: prismaApp.patient.phone,
            },
            consultation: prismaApp.consultation ? {
                id: prismaApp.consultation.id,
                status: prismaApp.consultation.status,
                prescription: prismaApp.consultation.prescription ? {
                    id: prismaApp.consultation.prescription.id,
                    instructions: prismaApp.consultation.prescription.instructions,
                    medicines: prismaApp.consultation.prescription.medicines.map(m => ({
                        id: m.id,
                        name: m.name,
                        dosage: m.dosage,
                        frequency: m.frequency,
                        duration: m.duration,
                        instructions: m.instructions,
                    })),
                } : null,
            } : null,
        };
    }


    toWithDoctorAndPatient(prismaApp: PrismaAppointmentWithDoctorAndPatient): AppointmentWithDoctorAndPatient {
        return {
            ...this.toWithDoctor(prismaApp),
            patient: {
                id: prismaApp.patient.id,
                patientId: prismaApp.patient.patientId,
                firstName: prismaApp.patient.firstName,
                lastName: prismaApp.patient.lastName,
                email: prismaApp.patient.user.email,
                phone: prismaApp.patient.phone,
            },
            payment: prismaApp.payment ? {
                id: prismaApp.payment.id,
                amount: prismaApp.payment.amount,
                status: prismaApp.payment.status,
                paymentMethod: prismaApp.payment.paymentMethod,
<<<<<<< HEAD
                transactionId: (prismaApp.payment as any).razorpayPaymentId || (prismaApp.payment as any).stripeSessionId || (prismaApp.payment as any).paypalOrderId
            } : undefined
=======
                transactionId: prismaApp.payment.razorpayPaymentId || prismaApp.payment.stripeSessionId || prismaApp.payment.paypalOrderId || prismaApp.payment.id
            } : undefined,
            consultation: prismaApp.consultation ? {
                id: prismaApp.consultation.id,
                status: prismaApp.consultation.status,
                vitals: prismaApp.consultation.vitals.map(v => ({
                    bloodPressure: v.bloodPressure,
                    heartRate: v.heartRate,
                    temperature: v.temperature,
                    weight: v.weight,
                })),
                medicalRecord: prismaApp.consultation.medicalRecord ? {
                    symptoms: prismaApp.consultation.medicalRecord.symptoms,
                    diagnosis: prismaApp.consultation.medicalRecord.diagnosis,
                    notes: prismaApp.consultation.medicalRecord.notes,
                    planForManagement: prismaApp.consultation.medicalRecord.planForManagement,
                } : null,
                prescription: prismaApp.consultation.prescription ? {
                    id: prismaApp.consultation.prescription.id,
                    instructions: prismaApp.consultation.prescription.instructions,
                    medicines: prismaApp.consultation.prescription.medicines.map(m => ({
                        id: m.id,
                        name: m.name,
                        dosage: m.dosage,
                        frequency: m.frequency,
                        duration: m.duration,
                        instructions: m.instructions,
                    })),
                } : null,
            } : null,
>>>>>>> 141ec674faa5e8dec8f62adfdfa63bd47aaf7909
        };
    }


    toPreview(prismaApp: PrismaAppointmentPreview): AppointmentPreview {
        return {
            ...this.toRecord(prismaApp),
            patient: {
                id: prismaApp.patient.id,
                patientId: prismaApp.patient.patientId,
                firstName: prismaApp.patient.firstName,
                lastName: prismaApp.patient.lastName,
                email: prismaApp.patient.user.email,
                phone: prismaApp.patient.phone,
            },
            doctor: {
                id: prismaApp.doctor.id,
                firstName: prismaApp.doctor.firstName,
                lastName: prismaApp.doctor.lastName,
                specialization: prismaApp.doctor.specialization ? { name: prismaApp.doctor.specialization.name } : null,
            }
        };
    }

};


export class AppointmentStatusMapper {
    static toPrisma(status : DomainAppointmentStatus) : PrismaAppointmentstatus {
        return status as unknown as PrismaAppointmentstatus
    }

    static toDomain(status : PrismaAppointmentstatus) : DomainAppointmentStatus {
        return status as unknown as DomainAppointmentStatus
    }
}
