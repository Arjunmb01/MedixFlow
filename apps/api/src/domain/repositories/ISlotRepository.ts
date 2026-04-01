
import { CreateSlotInput, SlotDto } from "../value-objects/types/slot.types";

export interface ISlotRepository {
    findByDoctorAndDate(
        doctorId : string,
        date :Date
    ) : Promise<SlotDto[]>

    createMany(slots : CreateSlotInput[]) : Promise<void>
    findById(slotId : string) : Promise<SlotDto | null>;
    incrementBooking(slotId : string) : Promise<SlotDto>
}