import { IConsultationRepository, ConsultationDraftDTO } from "../../../domain/repositories/IConsultationRepository";

export class GetConsultationDraftUseCase {
    constructor(private readonly consultationRepository: IConsultationRepository) {}

    async execute(consultationId: string): Promise<ConsultationDraftDTO | null> {
        return this.consultationRepository.getDraft(consultationId);
    }
}
