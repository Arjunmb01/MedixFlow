import { IConsultationRepository, SaveVitalsDTO, SaveMedicalRecordDTO, SavePrescriptionDTO } from "../../../domain/repositories/IConsultationRepository";
import { IAppointmentRepository } from "../../../domain/repositories/IAppointmentRepository";
import { SendNotificationUseCase } from "../notification/SendNotificationUseCase";
import { NotificationType } from "@/domain/value-objects/types/notification.types";

export class CompleteConsultationUseCase {
    constructor(
        private readonly consultationRepo: IConsultationRepository,
        private readonly appointmentRepo: IAppointmentRepository,
        private readonly sendNotificationUseCase: SendNotificationUseCase
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

        if (consultation.status !== "IN_PROGRESS" && consultation.status !== "COMPLETED") {
            throw new Error(`Cannot modify consultation from status: ${consultation.status}`);
        }

        // Save EMR Data via Repo
        await this.consultationRepo.saveConsultationData(consultationId, vitals, medicalRecord, prescription);

        // Update consultation status if it was in progress
        if (consultation.status === "IN_PROGRESS") {
            await this.consultationRepo.updateStatus(consultationId, "COMPLETED");
            // Update parent appointment status
            await this.appointmentRepo.updateStatus(consultation.appointmentId, "COMPLETED");

            // Notify Patient
            await this.sendNotificationUseCase.execute({
                recipientId: consultation.patientId,
                title: "Consultation Completed",
                message: "Your consultation has been successfully completed.",
                type: NotificationType.COMPLETED,
            });

            if (prescription) {
                await this.sendNotificationUseCase.execute({
                    recipientId: consultation.patientId,
                    title: "New Prescription",
                    message: "A new prescription has been uploaded for your recent consultation.",
                    type: NotificationType.PRESCRIPTION,
                });
            }
        }

        return this.consultationRepo.findById(consultationId);
    }
}