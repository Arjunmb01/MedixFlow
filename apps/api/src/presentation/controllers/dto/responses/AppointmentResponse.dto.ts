import { AppointmentStatus } from "../../../../domain/value-objects/enums/AppointmentStatus";

export interface AppointmentResponseDTO {
    id: string;
    patientId: string;
    doctorId: string;
    appointmentDate: Date;
    slotStart: string;
    slotEnd: string;
    status: AppointmentStatus | string;
    reason?: string | null;
    createdAt: Date;
    doctor?: {
        id: string;
        firstName: string;
        lastName: string;
        specialty: string | null;
    };
    patient?: {
        id: string;
        firstName: string;
        lastName: string;
        phone: string | null | undefined;
    };
}

import { AppointmentWithDoctorAndPatient } from "@/domain/repositories/IAppointmentRepository";

export class AppointmentResponseMapper {
    static toResponse(domain: AppointmentWithDoctorAndPatient): AppointmentResponseDTO {
        return {
            id: domain.id,
            patientId: domain.patientId,
            doctorId: domain.doctorId,
            appointmentDate: domain.appointmentDate,
            slotStart: domain.slotStart,
            slotEnd: domain.slotEnd,
            status: domain.status,
            reason: domain.reason,
            createdAt: domain.createdAt,
            doctor: domain.doctor ? {
                id: domain.doctor.id,
                firstName: domain.doctor.firstName,
                lastName: domain.doctor.lastName,
                specialty: domain.doctor.specialization?.name || null,
            } : undefined,
            patient: domain.patient ? {
                id: domain.patient.id,
                firstName: domain.patient.firstName,
                lastName: domain.patient.lastName,
                phone: domain.patient.phone,
            } : undefined,
        };
    }

    static toResponseList(domains: AppointmentWithDoctorAndPatient[]): AppointmentResponseDTO[] {
        return domains.map(d => this.toResponse(d));
    }
}
