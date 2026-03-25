import { IConsultationRepository, SaveVitalsDTO, SaveMedicalRecordDTO, SavePrescriptionDTO } from "../../../domain/repositories/IConsultationRepository";
import { PrismaClient } from "@prisma/client";
import { INotificationRepository } from "../../../domain/repositories/INotificationRepository";

// We need a small hack to update appointment status since IAppointmentRepository doesn't expose it directly yet, but we will use prisma directly here or assume it's exposed.
// Actually let's use PrismaClient for the appointment update to bypass creating a whole new method in IAppointmentRepository for now, or just add it.

export class CompleteConsultationUseCase {
    constructor(
        private readonly consultationRepo: IConsultationRepository,
        private readonly notificationRepo: INotificationRepository,
        private readonly prisma: PrismaClient
    ) {}

    async execute(
        consultationId: string, 
        doctorId: string,
        vitals?: SaveVitalsDTO,
        medicalRecord?: SaveMedicalRecordDTO,
        prescription?: SavePrescriptionDTO
    ) {
        const consultation = await this.consultationRepo.findById(consultationId);

        if (!consultation) {
            throw new Error("Consultation record not found.");
        }

        if (consultation.doctorId !== doctorId) {
            throw new Error("Unauthorized to modify this consultation.");
        }

        if (consultation.status !== "IN_PROGRESS") {
            throw new Error(`Cannot complete consultation from status: ${consultation.status}`);
        }

        // Save EMR Data via Repo
        await this.consultationRepo.saveConsultationData(consultationId, vitals, medicalRecord, prescription);

        // Update consultation status
        const completed = await this.consultationRepo.updateStatus(consultationId, "COMPLETED");

        // Update parent appointment status
        await this.prisma.appointment.update({
            where: { id: consultation.appointmentId },
            data: { status: "COMPLETED" }
        });

        // Notify patient
        await this.notificationRepo.create({
            userId: consultation.patient.id,
            type: "CONSULTATION",
            title: "Consultation Completed",
            message: `Your consultation with Dr. ${consultation.doctor.firstName} is complete. Your prescription and records are available.`
        });

        return this.consultationRepo.findById(consultationId);
    }
}