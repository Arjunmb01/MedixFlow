import { PrismaClient } from "@prisma/client";
import { ISlotRepository } from "@/domain/repositories/ISlotRepository";
import { CreateSlotInput, SlotDto } from "@/domain/value-objects/types/slot.types";
import { SlotMapper } from "../database/mappers/SlotMapper";

export class SlotRepository implements ISlotRepository {
    constructor(
        private readonly prisma: PrismaClient,
        private readonly mapper: SlotMapper
    ) {}

    async findByDoctorAndDate(doctorId: string, date: Date): Promise<SlotDto[]> {
        const results = await this.prisma.slot.findMany({
            where: { doctorId, date },
            orderBy: { startTime: "asc" },
        });
        return results.map(r => this.mapper.toDto(r));
    }

    async createMany(slots: CreateSlotInput[]): Promise<void> {
        await this.prisma.slot.createMany({
            data: slots.map(s => ({
                doctorId: s.doctorId,
                date: s.date,
                startTime: s.startTime,
                endTime: s.endTime,
                capacity: s.capacity,
                consultationType: s.consultationType,
                bookedCount: 0
            })),
            skipDuplicates: true,
        });
    }

    async findById(slotId: string): Promise<SlotDto | null> {
        const result = await this.prisma.slot.findUnique({
            where: { id: slotId }
        });
        return result ? this.mapper.toDto(result) : null;
    }

    async incrementBooking(slotId: string): Promise<SlotDto> {
        const result = await this.prisma.slot.update({
            where: { id: slotId },
            data: {
                bookedCount: {
                    increment: 1
                }
            }
        });
        return this.mapper.toDto(result);
    }
}
