import { ISlotRepository } from "@/domain/repositories/ISlotRepository";
import { SlotDto } from "@/domain/value-objects/types/slot.types";
import { GenerateSlotsUseCase } from "./generateSlots.usecase";

export interface GetAvailableSlotsUseCaseInput {
    doctorId: string;
    date: Date;
}

export class GetAvailableSlotCase {
    constructor(
        private readonly slotRepo: ISlotRepository,
        private readonly generateSlotsUseCase: GenerateSlotsUseCase
    ) {}

    async execute(input: GetAvailableSlotsUseCaseInput): Promise<(SlotDto & { available: boolean })[]> {
        const { doctorId, date } = input;
        
        let slots = await this.slotRepo.findByDoctorAndDate(doctorId, date);

        if (slots.length === 0) {
            await this.generateSlotsUseCase.execute({ doctorId, date });
            slots = await this.slotRepo.findByDoctorAndDate(doctorId, date);
        }

        return slots.map((slot) => ({
            ...slot,
            available: slot.bookedCount < slot.capacity
        }));
    }
}
