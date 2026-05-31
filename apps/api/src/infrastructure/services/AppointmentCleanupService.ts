import cron from "node-cron";
import { IAppointmentRepository } from "../../domain/repositories/IAppointmentRepository";
import { env } from "@/shared/config/env";

export class AppointmentCleanupService {
    constructor(private readonly appointmentRepo: IAppointmentRepository) {}

    public start(): void {
        if (env.NODE_ENV === "development") {
            console.log("[Cleanup] Skipped in development (use production or manual trigger).");
            return;
        }
        cron.schedule("* * * * *", async () => {
            await this.cleanup();
        });
        console.log("Appointment cleanup service started.");
    }

    private async cleanup(): Promise<void> {
        try {
            const now = new Date();
            const expired = await this.appointmentRepo.findExpiredPending(now);

            if (expired.length > 0) {
                const ids = expired.map(e => e.id);
                await this.appointmentRepo.cancelMany(ids);
                
                // Notify via socket to refresh slots if needed
                // We could emit a global event or per doctor
                const doctorIds = Array.from(new Set(expired.map(e => e.doctorId)));
                doctorIds.forEach(doctorId => {
                    // Logic to find which dates were affected
                    const affectedDates = expired
                        .filter(e => e.doctorId === doctorId)
                        .map(e => e.appointmentDate);
                    
                    // Emit update for each date
                    affectedDates.forEach(date => {
                        // socketService.emitSlotsUpdated(doctorId, date);
                    });
                });

                console.log(`[Cleanup] Cancelled ${expired.length} expired pending appointments.`);
            }
        } catch (error) {
            console.error("[Cleanup] Error during appointment cleanup:", error);
        }
    }
}
