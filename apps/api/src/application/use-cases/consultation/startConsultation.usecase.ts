import { IConsultationRepository } from "../../../domain/repositories/IConsultationRepository";

export class StartConsultationUseCase {
    constructor(
        private readonly consultationRepo: IConsultationRepository,
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



        return updated;
    }
}