import { IConsultationRepository } from "../../../domain/repositories/IConsultationRepository";
import { SendNotificationUseCase } from "../notification/SendNotificationUseCase";
import { NotificationType } from "@/domain/value-objects/types/notification.types";

export class UploadLabTestUseCase {
    constructor(
        private readonly consultationRepo: IConsultationRepository,
        private readonly sendNotificationUseCase: SendNotificationUseCase
    ) {}

    async execute(consultationId: string, labTestId: string, patientId: string, reportUrl: string) {
        const consultation = await this.consultationRepo.findById(consultationId);
        
        if (!consultation) throw new Error("Consultation not found");
        if (consultation.patientId !== patientId) throw new Error("Unauthorized");

        await this.consultationRepo.uploadLabTestReport(labTestId, reportUrl);

        // Notify doctor
        await this.sendNotificationUseCase.execute({
            recipientId: consultation.doctorId,
            title: "Lab Test Uploaded",
            message: `Patient ${consultation.patient.firstName} has uploaded a lab test report.`,
            type: NotificationType.LAB_TEST,
        });
    }
}
