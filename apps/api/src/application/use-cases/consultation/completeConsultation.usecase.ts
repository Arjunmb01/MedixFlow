import { IConsultationRepository, SaveVitalsDTO, SaveMedicalRecordDTO, SavePrescriptionDTO } from "../../../domain/repositories/IConsultationRepository";
import { IAppointmentRepository } from "../../../domain/repositories/IAppointmentRepository";
import { SendNotificationUseCase } from "../notification/SendNotificationUseCase";
import { NotificationType } from "@/domain/value-objects/types/notification.types";
import { socketService } from "@/infrastructure/services/SocketService";

export class CompleteConsultationUseCase {
    constructor(
        private readonly consultationRepo: IConsultationRepository,
        private readonly appointmentRepo: IAppointmentRepository,
        private readonly sendNotificationUseCase: SendNotificationUseCase
    ) {}

    async execute(
        consultationId: string, 
        doctorId: string,
        userId: string,
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

        if (consultation.status !== "IN_PROGRESS" && consultation.status !== "COMPLETED") {
            throw new Error(`Cannot modify consultation from status: ${consultation.status}`);
        }

        // Production-grade validation: Mandatory diagnosis before finalizing
        if (medicalRecord && !medicalRecord.diagnosis && consultation.status === "IN_PROGRESS") {
            throw new Error("Clinical Diagnosis is mandatory to complete a consultation.");
        }

        // Save EMR Data via Repo with revision tracking
        await this.consultationRepo.saveConsultationData(consultationId, vitals, medicalRecord, prescription, userId);

        // Update consultation status if it was in progress
        if (consultation.status === "IN_PROGRESS") {
            await this.consultationRepo.updateStatus(consultationId, "COMPLETED");
            // Update parent appointment status
            await this.appointmentRepo.updateStatus(consultation.appointmentId, "COMPLETED");

            // Notify Patient
            await this.sendNotificationUseCase.execute({
                recipientId: consultation.patientId,
                title: "Consultation Completed",
                message: `Your consultation with Dr. ${consultation.doctor.lastName} has been completed.`,
                type: NotificationType.COMPLETED,
            });

            if (prescription && prescription.medicines.length > 0) {
                await this.sendNotificationUseCase.execute({
                    recipientId: consultation.patientId,
                    title: "New Prescription",
                    message: "A new prescription has been added to your medical records.",
                    type: NotificationType.PRESCRIPTION,
                });
            }

            // Real-time update to patient/doctor dashboard
            socketService.emitToUser(consultation.patientId, "consultation_completed", {
                consultationId: consultation.id,
                status: "COMPLETED"
            });
        }

        return this.consultationRepo.findById(consultationId);
    }
}
