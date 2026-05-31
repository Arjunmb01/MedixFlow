import cron from "node-cron";
import { IAppointmentRepository } from "../../domain/repositories/IAppointmentRepository";
import { env } from "@/shared/config/env";
import { ILockService } from "@/application/interfaces/ILockService";

export class AppointmentCleanupService {
    constructor(
        private readonly appointmentRepo: IAppointmentRepository,
        private readonly lockService: ILockService
    ) {}

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
        // FIX [SCALABILITY]: Prevent multiple instances from running the cleanup simultaneously
        const lockKey = "cron:appointment_cleanup";
        const acquired = await this.lockService.acquireLock(lockKey, 55000); // Lock for 55s (cron runs every 60s)
        
        if (!acquired) return;

        try {
            const now = new Date();
            const expired = await this.appointmentRepo.findExpiredPending(now);

            if (expired.length > 0) {
                const ids = expired.map(e => e.id);
                await this.appointmentRepo.cancelMany(ids);
                
                const doctorIds = Array.from(new Set(expired.map(e => e.doctorId)));
                doctorIds.forEach(doctorId => {
                    // FIX [LOGICAL]: Map to ISO string before Set to ensure unique dates
                    const affectedDates = Array.from(new Set(
                        expired
                            .filter(e => e.doctorId === doctorId)
                            .map(e => e.appointmentDate.toISOString().split('T')[0])
                    ));
                    
                    affectedDates.forEach(dateStr => {
                        const date = new Date(dateStr);
                        // socketService.emitSlotsUpdated(doctorId, date);
                    });
                });

                console.log(`[Cleanup] Cancelled ${expired.length} expired pending appointments.`);
            }
        } catch (error) {
            console.error("[Cleanup] Error during appointment cleanup:", error);
        } finally {
            // No need to release immediately if we want to ensure only one runs per minute
            // but for safety we release or let it expire.
            await this.lockService.releaseLock(lockKey);
        }
    }
}
