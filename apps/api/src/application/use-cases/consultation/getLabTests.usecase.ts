import { IConsultationRepository } from "../../../domain/repositories/IConsultationRepository";
import { AppError } from "../../../shared/errors/AppError";
import { StatusCode } from "../../../shared/constants/statusCodes";
import { MESSAGES } from "../../../shared/constants/messages";

export class GetLabTestsUseCase {
    constructor(private readonly consultationRepo: IConsultationRepository) {}

    async execute(consultationId: string, userId: string, role: string) {
        const consultation = await this.consultationRepo.findById(consultationId);
        
        if (!consultation) {
            throw new AppError("Consultation not found", StatusCode.NOT_FOUND);
        }

        // Authorization: Verify doctor ownership, patient ownership, or administrative access
        const isAuthorizedDoctor = role === 'DOCTOR' && consultation.doctor.id === userId;
        const isAuthorizedPatient = role === 'PATIENT' && consultation.patient.id === userId;
        const isAuthorizedAdmin = role === 'ADMIN';

        if (!isAuthorizedDoctor && !isAuthorizedPatient && !isAuthorizedAdmin) {
            throw new AppError(MESSAGES.INSUFFICIENT_PERMISSIONS, StatusCode.FORBIDDEN);
        }

        return this.consultationRepo.getLabTestsByConsultation(consultationId);
    }
}
