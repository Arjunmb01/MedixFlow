import { IAppointmentRepository, AppointmentRecord } from "@/domain/repositories/IAppointmentRepository";
import { BusinessRuleError } from "@/domain/value-objects/errors/BaseDomainError";

export interface BookSlotUseCaseInput {
    doctorId: string;
    patientId: string;
    startTime: Date;
    endTime: Date;
    reason?: string;
}

export class BookSlotUseCase {
    constructor (
        private readonly appointmentRepo: IAppointmentRepository
    ) {}

    async execute(input: BookSlotUseCaseInput): Promise<AppointmentRecord> {
        const { doctorId, patientId, startTime, endTime, reason } = input;
        
        try {
            return await this.appointmentRepo.bookAtomic({
                doctorId,
                patientId,
                startTime: new Date(startTime),
                endTime: new Date(endTime),
                reason
            });
        } catch (error: any) {
            if (error.message === "SLOT_ALREADY_BOOKED") {
                throw new BusinessRuleError("This slot is already booked. Please choose another one.");
            }
            throw error;
        }
    }
 }
