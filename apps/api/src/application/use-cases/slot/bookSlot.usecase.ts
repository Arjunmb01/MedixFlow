import { ISlotRepository } from "@/domain/repositories/ISlotRepository";
import { IConsultationRepository } from "@/domain/repositories/IConsultationRepository";
import { ResourceNotFoundError, BusinessRuleError } from "@/domain/value-objects/errors/BaseDomainError";

export interface BookSlotUseCaseInput {
    slotId: string;
    patientId: string;
}

export class BookSlotUseCase {
    constructor (
        private readonly slotRepo: ISlotRepository,
        private readonly consultationRepo: IConsultationRepository
    ) {}

    async execute(input: BookSlotUseCaseInput): Promise<void> {
        const { slotId, patientId } = input;
        
        const slot = await this.slotRepo.findById(slotId);
        if (!slot) {
            throw new ResourceNotFoundError("Slot", slotId);
        }

        if (slot.bookedCount >= slot.capacity) {
            throw new BusinessRuleError("This slot is already full.");
        }
        
        await this.slotRepo.incrementBooking(slotId);
        
        await this.consultationRepo.create({
            doctorId: slot.doctorId,
            patientId,
        } as any);
    }
 }
