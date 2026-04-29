import { IDoctorProfileRepository } from "@/domain/repositories/IDoctorRepository";
import { IAppointmentRepository } from "@/domain/repositories/IAppointmentRepository";
import { IDoctorLeaveRepository } from "@/domain/repositories/IDoctorLeaveRepository";
import { SlotGenerator, GeneratedSlot } from "@/domain/services/SlotGenerator";

export interface GetAvailableSlotsUseCaseInput {
    doctorId: string;
    date: Date;
}

export class GetAvailableSlotCase {
    constructor(
        private readonly doctorRepo: IDoctorProfileRepository,
        private readonly appointmentRepo: IAppointmentRepository,
        private readonly leaveRepo: IDoctorLeaveRepository,
        private readonly slotGenerator: SlotGenerator
    ) {}

    async execute(input: GetAvailableSlotsUseCaseInput): Promise<GeneratedSlot[]> {
        const { doctorId, date } = input;
        
        // Reset time to start of day for consistency
        const searchDate = new Date(date);
        searchDate.setHours(0, 0, 0, 0);

        const dayOfWeek = searchDate.getDay();

        // 1. Fetch all necessary data in parallel
        const [schedules, breaks, leaves, appointments] = await Promise.all([
            this.doctorRepo.getSchedulesByDay(doctorId, dayOfWeek),
            this.doctorRepo.getBreaksByDay(doctorId, dayOfWeek),
            this.leaveRepo.findByDoctor(doctorId),
            this.appointmentRepo.getAppointmentsForSlotGeneration(doctorId, searchDate)
        ]);

        if (!schedules || schedules.length === 0) {
            return [];
        }

        // 2. Map data to the format expected by the SlotGenerator
        const mapTimeToDate = (timeStr: string, baseDate: Date): Date => {
            const [hours, minutes] = timeStr.split(':').map(Number);
            const d = new Date(baseDate);
            d.setHours(hours, minutes, 0, 0);
            return d;
        };

        const workingDay = {
            shifts: schedules.map(s => ({
                start: mapTimeToDate(s.startTime, searchDate),
                end: mapTimeToDate(s.endTime, searchDate)
            })),
            breaks: breaks.map(b => ({
                start: mapTimeToDate(b.startTime, searchDate),
                end: mapTimeToDate(b.endTime, searchDate)
            })),
            leaves: leaves
                .filter(l => l.status === "APPROVED")
                .map(l => ({
                    start: l.startDate,
                    end: l.endDate
                })),
            appointments: appointments
                .filter(a => a.startTime && a.endTime)
                .map(a => ({
                    start: a.startTime!,
                    end: a.endTime!
                }))
        };

        // 3. Generate slots
        // Use the duration from the first schedule found for that day
        const config = {
            slotDurationMinutes: schedules[0].slotDurationMinutes,
            bufferTimeMinutes: (schedules[0] as any).bufferTimeMinutes || 0,
            date: searchDate
        };

        return this.slotGenerator.generate(config, workingDay);
    }
}
