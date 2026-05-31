import { IConsultationRepository, ConsultationDraftDTO } from "../../../domain/repositories/IConsultationRepository";

export class SaveConsultationDraftUseCase {
    constructor(private readonly consultationRepository: IConsultationRepository) {}

    async execute(consultationId: string, draft: ConsultationDraftDTO): Promise<void> {
        // Validation could be added here if needed
        await this.consultationRepository.saveDraft(consultationId, draft);
    }
}
