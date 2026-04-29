export class Slot {
  constructor(
    public readonly id: string,
    public readonly doctorId: string,
    public readonly date: Date,
    public readonly startTime: Date,
    public readonly endTime: Date,
    public readonly capacity: number,
    public readonly bookedCount: number
  ) {}

    isAvaliable () {
        return this.bookedCount < this.capacity;
    }
}
