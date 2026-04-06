import { Slot } from "@prisma/client";
import { SlotDto } from "../../../domain/value-objects/types/slot.types";

export class SlotMapper {
    toDto(prismaSlot: Slot): SlotDto {
        if (!prismaSlot) {
            throw new Error("Slot data is missing")
        }
        
        return {
            id: prismaSlot.id,
            doctorId: prismaSlot.doctorId,
            date: prismaSlot.date,
            startTime: prismaSlot.startTime,
            endTime: prismaSlot.endTime,
            isBooked: prismaSlot.bookedCount >= prismaSlot.capacity,
            bookedCount: prismaSlot.bookedCount,
            capacity: prismaSlot.capacity,
            consultationType: prismaSlot.consultationType as "VIDEO" | "CLINIC"
        };
    }
}

