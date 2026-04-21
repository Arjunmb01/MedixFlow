import { IConsultationRepository, LabTestRequestDTO } from "../../../domain/repositories/IConsultationRepository";
import { SendNotificationUseCase } from "../notification/SendNotificationUseCase";
import { NotificationType } from "@/domain/value-objects/types/notification.types";
import { IAppointmentRepository } from "../../../domain/repositories/IAppointmentRepository";

export class RequestLabTestUseCase {
    constructor(
        private readonly consultationRepo: IConsultationRepository,
        private readonly sendNotificationUseCase: SendNotificationUseCase
    ) {}

    async execute(consultationId: string, doctorId: string, tests: LabTestRequestDTO[]) {
        const consultation = await this.consultationRepo.findById(consultationId);
        
        if (!consultation) throw new Error("Consultation not found");
        if (consultation.doctorId !== doctorId) throw new Error("Unauthorized");

        await this.consultationRepo.requestLabTests(consultationId, tests);

        // Notify patient
        await this.sendNotificationUseCase.execute({
            recipientId: consultation.patientId,
            title: "Lab Test Requested",
            message: `Dr. ${consultation.doctor.lastName} has requested a lab test.`,
            type: NotificationType.LAB_TEST,
        });
    }
}
