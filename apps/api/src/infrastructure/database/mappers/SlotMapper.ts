import { Slot } from "@prisma/client";
import { SlotDto } from "../../../domain/value-objects/types/slot.types";

export class SlotMapper {
    /**
     * Maps a Prisma slot record to a Slot DTO.
     */
    toDto(prismaSlot: Slot): SlotDto {
        if (!prismaSlot) return null as unknown as SlotDto;
        
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

