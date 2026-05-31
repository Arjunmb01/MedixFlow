export interface IDateTimeService {
  now(): Date;
  toDateTime(date: Date | string, time: string): Date;
  isUpcoming(date: Date, time: string): boolean;
  isTodayOrFuture(date: Date | string): boolean;
  isWithinCheckInWindow(date: Date, time: string): boolean;
<<<<<<< HEAD
  isWithinVideoConsultationWindow(date: Date, slotStart: string, slotEnd: string): boolean;
=======
  getDaysDifference(date1: Date, date2: Date): number;
  addDays(date: Date, days: number): Date;
  combineDateAndTimeString(date: Date, time: string): Date;
>>>>>>> 141ec674faa5e8dec8f62adfdfa63bd47aaf7909
}
