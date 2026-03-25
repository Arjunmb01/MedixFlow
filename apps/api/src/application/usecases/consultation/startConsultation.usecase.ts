import { IConsultationRepository } from "../../../domain/repositories/IConsultationRepository";
import { INotificationRepository } from "../../../domain/repositories/INotificationRepository";

export class StartConsultationUseCase {
    constructor(
        private readonly consultationRepo: IConsultationRepository,
        private readonly notificationRepo: INotificationRepository
    ) {}

    async execute(consultationId: string, doctorId: string) {
        const consultation = await this.consultationRepo.findById(consultationId);

        if (!consultation) {
            throw new Error("Consultation record not found.");
        }

        if (consultation.doctorId !== doctorId) {
            throw new Error("Unauthorized access to consultation.");
        }

        if (consultation.status !== "WAITING") {
            throw new Error(`Cannot start consultation. Current status is ${consultation.status}`);
        }

        const updated = await this.consultationRepo.updateStatus(consultationId, "IN_PROGRESS");

        // Notify patient
        await this.notificationRepo.create({
            userId: consultation.patient.id, // Patient profile ID matches User ID
            type: "CONSULTATION",
            title: "Consultation Started",
            message: `The doctor is ready and your consultation has started.`
        });

        return updated;
    }
}