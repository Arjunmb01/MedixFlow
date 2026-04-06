
export class SchedulingPolicy {
    private static readonly DURATION_TO_CAPACITY: Record<number, number> = {
        15: 1,
        30: 2,
        60: 5
    };

    public calculateSlotCapacity(durationMinutes: number): number {
        return SchedulingPolicy.DURATION_TO_CAPACITY[durationMinutes] ?? 1;
    }
}
