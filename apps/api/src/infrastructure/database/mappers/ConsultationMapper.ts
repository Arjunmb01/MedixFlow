import { Consultation } from "@prisma/client";
import { 
    ConsultationWithDetails, 
    ConsultationQueueItem 
} from "../../../domain/repositories/IConsultationRepository";

export class ConsultationMapper {
    toDomain(prismaCons: ConsultationWithDetails): ConsultationWithDetails {
        if (!prismaCons) return null as unknown as ConsultationWithDetails;
        
        return {
            id: prismaCons.id,
            appointmentId: prismaCons.appointmentId,
            patientId: prismaCons.patientId,
            doctorId: prismaCons.doctorId,
            status: prismaCons.status,
            createdAt: prismaCons.createdAt,
            startedAt: prismaCons.startedAt,
            completedAt: prismaCons.completedAt,
            vitals: prismaCons.vitals || [],
            medicalRecord: prismaCons.medicalRecord || null,
            prescription: prismaCons.prescription || null,
            patient: prismaCons.patient,
            doctor: prismaCons.doctor,
            appointment: prismaCons.appointment
        };
    }

    toQueueItem(prismaCons: ConsultationQueueItem): ConsultationQueueItem {
        if (!prismaCons) return null as unknown as ConsultationQueueItem;
        
        return {
            ...prismaCons,
            patient: prismaCons.patient,
            appointment: prismaCons.appointment
        };
    }
}
