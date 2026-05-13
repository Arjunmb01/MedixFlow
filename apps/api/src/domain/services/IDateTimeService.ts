export interface IDateTimeService {
  now(): Date;
  toDateTime(date: Date | string, time: string): Date;
  isUpcoming(date: Date, time: string): boolean;
  isTodayOrFuture(date: Date | string): boolean;
  isWithinCheckInWindow(date: Date, time: string): boolean;
  getDaysDifference(date1: Date, date2: Date): number;
  addDays(date: Date, days: number): Date;
  combineDateAndTimeString(date: Date, time: string): Date;
}
