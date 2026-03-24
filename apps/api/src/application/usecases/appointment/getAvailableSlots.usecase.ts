import { IAppointmentRepository } from "@/domain/repositories/IAppointmentRepository";

export interface Slot {
    start: string;
    end: string;
    capacity: number;
    booked: number;
    available: number;
    isFull: boolean;
    isPast: boolean;
}

export class GetAvailableSlotsUseCase {
    constructor(private readonly appointmentRepo: IAppointmentRepository) {}

    async execute(doctorId: string, date: Date): Promise<Slot[]> {
        // Evaluate based on UTC so the day matches the exact YYYY-MM-DD passed
        const dayOfWeek = date.getUTCDay();
        const schedule = await this.appointmentRepo.getDoctorSchedule(doctorId, dayOfWeek);

        if (!schedule) return [];

        const slotDuration = 60;
        const capacity = schedule.slotCapacity;

        const toMinutes = (time: string): number => {
            const [h, m] = time.split(":").map(Number);
            return h * 60 + m;
        };

        const toTimeString = (minutes: number): string => {
            return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
        };

        const start = toMinutes(schedule.startTime);
        const end = toMinutes(schedule.endTime);


        const now = new Date();
        const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        const requestedDateStr = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
        
        const isToday = todayStr === requestedDateStr;
        const currentMinutes = now.getHours() * 60 + now.getMinutes();

        const slots: Slot[] = [];

        for (let t = start; t < end; t += slotDuration) {
            const slotEnd = t + slotDuration;
            if (slotEnd > end) break;

            slots.push({
                start: toTimeString(t),
                end: toTimeString(slotEnd),
                capacity,
                booked: 0,
                available: capacity,
                isFull: false,
                isPast: isToday && t < currentMinutes,
            });
        }

        const appointments = await this.appointmentRepo.getAppointmentsByDoctorAndDate(doctorId, date);

        const bookingCount = new Map<string, number>();
        for (const appt of appointments) {
            if (appt.status !== "CANCELLED") {
                const current = bookingCount.get(appt.slotStart) ?? 0;
                bookingCount.set(appt.slotStart, current + 1);
            }
        }

        return slots.map((slot) => {
            const booked = bookingCount.get(slot.start) ?? 0;
            const available = Math.max(0, capacity - booked);
            return {
                ...slot,
                booked,
                available,
                isFull: booked >= capacity,
            };
        });
    }
}