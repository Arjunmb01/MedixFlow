import { IConsultationRepository } from "../../../domain/repositories/IConsultationRepository";
import { SendNotificationUseCase } from "../notification/SendNotificationUseCase";
import { NotificationType } from "@/domain/value-objects/types/notification.types";

export class ReviewLabTestUseCase {
    constructor(
        private readonly consultationRepo: IConsultationRepository,
        private readonly sendNotificationUseCase: SendNotificationUseCase
    ) {}

    async execute(consultationId: string, labTestId: string, doctorId: string, comments?: string, isAbnormal?: boolean) {
        const consultation = await this.consultationRepo.findById(consultationId);
        
        if (!consultation) throw new Error("Consultation not found");
        if (consultation.doctorId !== doctorId) throw new Error("Unauthorized: Only the assigned doctor can review lab tests.");

        await this.consultationRepo.reviewLabTest(labTestId, doctorId, comments, isAbnormal);

        // Notify patient
        await this.sendNotificationUseCase.execute({
            recipientId: consultation.patientId,
            title: "Lab Test Reviewed",
            message: `Dr. ${consultation.doctor.lastName} has reviewed your lab test result.`,
            type: NotificationType.LAB_TEST,
        });

        return { success: true };
    }
}
