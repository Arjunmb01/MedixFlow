import { IConsultationRepository, ConsultationHistoryItem } from "../../../domain/repositories/IConsultationRepository";

export class GetPatientHistoryUseCase {
    constructor(private readonly consultationRepo: IConsultationRepository) {}

    async execute(patientId: string): Promise<ConsultationHistoryItem[]> {
        return this.consultationRepo.getPatientHistory(patientId);
    }
}
