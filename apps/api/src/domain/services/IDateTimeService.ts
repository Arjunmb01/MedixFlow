export interface IDateTimeService {
  now(): Date;
  toDateTime(date: Date | string, time: string): Date;
  isUpcoming(date: Date, time: string): boolean;
  isTodayOrFuture(date: Date | string): boolean;
  isWithinCheckInWindow(date: Date, time: string): boolean;
}
