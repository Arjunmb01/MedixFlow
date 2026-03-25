import { IConsultationRepository } from "../../../domain/repositories/IConsultationRepository";

export class GetDoctorQueueUseCase {
    constructor(private readonly consultationRepo: IConsultationRepository) {}

    async execute(doctorId: string, date: Date = new Date()) {
        return this.consultationRepo.getDoctorQueue(doctorId, date);
    }
}
