import { IConsultationRepository, ConsultationWithDetails } from "@/domain/repositories/IConsultationRepository";

export interface GetConsultationDetailsInput {
    id: string;
    doctorId: string;
}

export class GetConsultationDetailsUseCase {
    constructor(private readonly consultationRepo: IConsultationRepository) {}

    async execute(input: GetConsultationDetailsInput): Promise<ConsultationWithDetails> {
        const { id, doctorId } = input;
        
        const consultation = await this.consultationRepo.findById(id);
        
        if (!consultation) {
            throw new Error("Consultation not found");
        }

        if (consultation.doctorId !== doctorId) {
            throw new Error("Unauthorized access to this consultation");
        }

        return consultation;
    }
}
