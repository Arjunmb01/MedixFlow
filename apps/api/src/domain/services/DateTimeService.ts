export class DateTimeService {
    static toDateTime(date: Date | string, time: string): Date {
        const d = new Date(date);
        const year = d.getUTCFullYear();
        const month = String(d.getUTCMonth() + 1).padStart(2, '0');
        const day = String(d.getUTCDate()).padStart(2, '0');
        
        return new Date(`${year}-${month}-${day}T${time}:00`);
    }

    static isUpcoming(date : Date,time : string) : boolean {
        return this.toDateTime(date,time) >= new Date()
    }

    static isTodayOrFuture(date: Date | string): boolean {
        const d = new Date(date);
        const apptDate = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        return apptDate >= today;
    }

    static isWithinCheckInWindow(date : Date, time: string) : boolean {
        const now = new Date();
        const appt = this.toDateTime(date,time);
        const diff = (appt.getTime() - now.getTime()) / (1000 * 60)

        return diff <= 15 && diff >= -10
    }
}