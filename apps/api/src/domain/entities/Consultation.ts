import { ConsultationStatus } from "../value-objects/enums/ConsultationStatus";
import { ConsultationAlreadyStartedError, ConsultationAlreadyCompletedError } from "../value-objects/errors/ConsultationErrors";

export class Consultation {
    constructor(
        public readonly id: string,
        public readonly doctorId: string,
        public readonly patientId: string,
        public status: ConsultationStatus,
        public startedAt: Date | null,
        public completedAt: Date | null,
        public readonly createdAt: Date
    ) {}

    public start(): void {
        if (this.status === ConsultationStatus.IN_PROGRESS) {
            throw new ConsultationAlreadyStartedError(this.id);
        }
        if (this.status === ConsultationStatus.COMPLETED) {
            throw new ConsultationAlreadyCompletedError(this.id);
        }
        this.status = ConsultationStatus.IN_PROGRESS;
        this.startedAt = new Date();
    }

    public complete(): void {
        if (this.status === ConsultationStatus.COMPLETED) {
            throw new ConsultationAlreadyCompletedError(this.id);
        }
        this.status = ConsultationStatus.COMPLETED;
        this.completedAt = new Date();
    }
}
