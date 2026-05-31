import { IAppointmentRepository } from "../../../domain/repositories/IAppointmentRepository";
import { IPatientRepository } from "../../../domain/repositories/IPatientRepository";
import { CalculateProfileCompletionUseCase } from "./CalculateProfileCompletionUseCase";

export class GetPatientDashboardStatsUseCase {
    constructor(
        private readonly appointmentRepo: IAppointmentRepository,
        private readonly patientRepo: IPatientRepository,
        private readonly calculateProfileCompletionUseCase: CalculateProfileCompletionUseCase
    ) {}

    async execute(userId: string) {
        const [summary, patient] = await Promise.all([
            this.appointmentRepo.getPatientDashboardSummary(userId),
            this.patientRepo.findById(userId),
        ]);

<<<<<<< HEAD
=======
        const patientAppointments = appointments.data;
        const now = this.dateTimeService.now();
        
        const upcomingAppointments = patientAppointments
            .filter((app: any) => 
                this.dateTimeService.isTodayOrFuture(app.appointmentDate) && 
                app.status !== "CANCELLED" && 
                app.status !== "COMPLETED"
            )
            .sort((a: any, b: any) => {
                const dateA = this.dateTimeService.toDateTime(a.appointmentDate, a.slotStart);
                const dateB = this.dateTimeService.toDateTime(b.appointmentDate, b.slotStart);
                return dateA.getTime() - dateB.getTime();
            });
        const nextAppointment = upcomingAppointments.length > 0 ? upcomingAppointments[0] : null;

        const recentAppointments = patientAppointments
            .filter((app: any) => new Date(app.appointmentDate) < now || app.status === "CANCELLED" || app.status === "COMPLETED")
            .sort((a: any, b: any) => new Date(b.lastStatusChangedAt || b.createdAt).getTime() - new Date(a.lastStatusChangedAt || a.createdAt).getTime())
            .slice(0, 5);

>>>>>>> 141ec674faa5e8dec8f62adfdfa63bd47aaf7909
        const profileCompletion = this.calculateProfileCompletionUseCase.execute(patient);

        return {
            upcomingAppointmentsCount: summary.upcomingCount,
            nextAppointment: summary.nextAppointment,
            recentAppointments: summary.recentAppointments,
            profileCompletion,
            medicalRecordsCount: 0,
        };
    }
}
