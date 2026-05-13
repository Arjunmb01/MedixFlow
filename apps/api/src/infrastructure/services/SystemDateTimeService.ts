import { IDateTimeService } from "@/domain/services/IDateTimeService";

export class SystemDateTimeService implements IDateTimeService {
  now(): Date {
    return new Date();
  }

  toDateTime(date: Date | string, time: string): Date {
    const d = new Date(date);
    const year = d.getUTCFullYear();
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    
    return new Date(`${year}-${month}-${day}T${time}:00`);
  }

  isUpcoming(date: Date, time: string): boolean {
    return this.toDateTime(date, time) >= this.now();
  }

  isTodayOrFuture(date: Date | string): boolean {
    const d = new Date(date);
    const apptDate = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
    const today = this.now();
    today.setUTCHours(0, 0, 0, 0);
    return apptDate >= today;
  }

  isWithinCheckInWindow(date: Date, time: string): boolean {
    const now = this.now();
    const appt = this.toDateTime(date, time);
    const diff = (appt.getTime() - now.getTime()) / (1000 * 60);

    return diff <= 30 && diff >= -10;
  }

  getDaysDifference(date1: Date, date2: Date): number {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    d1.setUTCHours(0, 0, 0, 0);
    d2.setUTCHours(0, 0, 0, 0);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  combineDateAndTimeString(date: Date, time: string): Date {
    return this.toDateTime(date, time);
  }
}
