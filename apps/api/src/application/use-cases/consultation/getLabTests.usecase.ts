import { IConsultationRepository } from "../../../domain/repositories/IConsultationRepository";

export class GetLabTestsUseCase {
    constructor(private readonly consultationRepo: IConsultationRepository) {}

    async execute(consultationId: string) {
        return this.consultationRepo.getLabTestsByConsultation(consultationId);
    }
}
