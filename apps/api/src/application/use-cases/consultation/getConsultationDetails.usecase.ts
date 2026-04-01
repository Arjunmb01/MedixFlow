import { IConsultationRepository, ConsultationWithDetails } from "../../../domain/repositories/IConsultationRepository";
import { ConsultationNotFoundError } from "../../../domain/value-objects/errors/ConsultationErrors";
import { UnauthorizedError } from "../../../domain/value-objects/errors/BaseDomainError";

export interface GetConsultationDetailsUseCaseInput {
    id: string;
    doctorId: string;
}

export class GetConsultationDetailsUseCase {
    constructor(private readonly consultationRepo: IConsultationRepository) {}

    async execute(input: GetConsultationDetailsUseCaseInput): Promise<ConsultationWithDetails> {
        const { id, doctorId } = input;
        const consultation = await this.consultationRepo.findById(id);
        
        if (!consultation) {
            throw new ConsultationNotFoundError(id);
        }
        
        if (consultation.doctorId !== doctorId) {
            throw new UnauthorizedError("Unauthorized access to these consultation records.");
        }
        
        return consultation;
    }
}

