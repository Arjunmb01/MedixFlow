
export interface TimeInterval {
  start: Date;
  end: Date;
}

export interface DoctorWorkingDay {
  shifts: TimeInterval[];
  breaks: TimeInterval[];
  leaves: TimeInterval[];
  appointments: TimeInterval[];
}

export interface SlotGeneratorConfig {
  slotDurationMinutes: number;
  bufferTimeMinutes: number;
  date: Date; // The specific day we are generating for
}

export interface GeneratedSlot {
  startTime: Date;
  endTime: Date;
  available: boolean;
}

export class SlotGenerator {
  /**
   * Generates available time slots for a specific doctor on a specific day.
   */
  public generate(
    config: SlotGeneratorConfig,
    data: DoctorWorkingDay
  ): GeneratedSlot[] {
    const { slotDurationMinutes, bufferTimeMinutes } = config;
    const slots: GeneratedSlot[] = [];

    // 1. For each shift, generate potential slots
    for (const shift of data.shifts) {
      let currentStart = new Date(shift.start);

      while (true) {
        const currentEnd = new Date(currentStart.getTime() + slotDurationMinutes * 60000);

        // If the slot exceeds the shift end, stop this shift
        if (currentEnd > shift.end) break;

        const slotInterval: TimeInterval = { start: currentStart, end: currentEnd };

        // 2. Check if this slot overlaps with any breaks, leaves, or appointments
        const isBlocked = this.isIntervalBlocked(slotInterval, data.breaks, data.leaves, data.appointments);

        slots.push({
          startTime: new Date(currentStart),
          endTime: new Date(currentEnd),
          available: !isBlocked
        });

        // 3. Move to the next slot, adding buffer time
        currentStart = new Date(currentEnd.getTime() + bufferTimeMinutes * 60000);
      }
    }

    return slots;
  }

  /**
   * Checks if a given time interval overlaps with any blocked intervals.
   */
  private isIntervalBlocked(
    interval: TimeInterval,
    breaks: TimeInterval[],
    leaves: TimeInterval[],
    appointments: TimeInterval[]
  ): boolean {
    const isOverlapping = (a: TimeInterval, b: TimeInterval) => {
      // (StartA < EndB) and (EndA > StartB)
      return a.start < b.end && a.end > b.start;
    };

    // Check Breaks
    if (breaks.some(b => isOverlapping(interval, b))) return true;

    // Check Leaves
    if (leaves.some(l => isOverlapping(interval, l))) return true;

    // Check Appointments
    if (appointments.some(app => isOverlapping(interval, app))) return true;

    return false;
  }
}
