import { IConsultationRepository, SaveVitalsDTO, SaveMedicalRecordDTO, SavePrescriptionDTO } from "../../../domain/repositories/IConsultationRepository";
import { IAppointmentRepository } from "../../../domain/repositories/IAppointmentRepository";

export class CompleteConsultationUseCase {
    constructor(
        private readonly consultationRepo: IConsultationRepository,
        private readonly appointmentRepo: IAppointmentRepository
    ) {}

    async execute(
        consultationId: string, 
        doctorId: string,
        vitals?: SaveVitalsDTO,
        medicalRecord?: SaveMedicalRecordDTO,
        prescription?: SavePrescriptionDTO
    ) {
        const consultation = await this.consultationRepo.findById(consultationId);

        if (!consultation) {
            throw new Error("Consultation record not found.");
        }

        if (consultation.doctorId !== doctorId) {
            throw new Error("Unauthorized to modify this consultation.");
        }

        if (consultation.status !== "IN_PROGRESS") {
            throw new Error(`Cannot complete consultation from status: ${consultation.status}`);
        }

        // Save EMR Data via Repo
        await this.consultationRepo.saveConsultationData(consultationId, vitals, medicalRecord, prescription);

        // Update consultation status
        await this.consultationRepo.updateStatus(consultationId, "COMPLETED");

        // Update parent appointment status
        await this.appointmentRepo.updateStatus(consultation.appointmentId, "COMPLETED");

        return this.consultationRepo.findById(consultationId);
    }
}