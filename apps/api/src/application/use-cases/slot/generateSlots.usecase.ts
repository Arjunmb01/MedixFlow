import { ISlotRepository } from "@/domain/repositories/ISlotRepository";
import { IDoctorRepository } from "@/domain/repositories/IDoctorRepository";
import { CreateSlotInput } from "@/domain/value-objects/types/slot.types";

export interface GenerateSlotsUseCaseInput {
    doctorId: string;
    date: Date;
}

export class GenerateSlotsUseCase {
    constructor(
        private readonly slotRepo: ISlotRepository,
        private readonly doctorRepo: IDoctorRepository
    ) {}

    async execute(input: GenerateSlotsUseCaseInput): Promise<void> {
        const { doctorId, date } = input;
        const dayOfWeek = date.getDay();

        const existingSlots = await this.slotRepo.findByDoctorAndDate(doctorId, date);
        if (existingSlots.length > 0) return;

        const schedules = await this.doctorRepo.getSchedulesByDay(doctorId, dayOfWeek);
        const slots: CreateSlotInput[] = [];

        for (const s of schedules) {
            const [startHour, startMin] = s.startTime.split(':').map(Number);
            const [endHour, endMin] = s.endTime.split(':').map(Number);

            let current = new Date(date);
            current.setHours(startHour, startMin, 0, 0);

            const end = new Date(date);
            end.setHours(endHour, endMin, 0, 0);

            while (current < end) {
                const next = new Date(current.getTime() + s.slotDurationMinutes * 60000);
                if (next > end) break;
                
                const calculateCapacity = (duration: number): number => {
                    if (duration === 15) return 1;
                    if (duration === 30) return 2;
                    if (duration === 60) return 5;
                    return 1; 
                };

                slots.push({
                    doctorId,
                    date: new Date(date),
                    startTime: new Date(current),
                    endTime: new Date(next),
                    capacity: calculateCapacity(s.slotDurationMinutes),
                    consultationType: s.consultationType
                });

                current = next;
            }
        }

        if (slots.length > 0) {
            await this.slotRepo.createMany(slots);
        }
    }
}
