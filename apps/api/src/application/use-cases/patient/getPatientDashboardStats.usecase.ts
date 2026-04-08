import { IAppointmentRepository } from "../../../domain/repositories/IAppointmentRepository";
import { IPatientRepository } from "../../../domain/repositories/IPatientRepository";
import { CalculateProfileCompletionUseCase } from "./CalculateProfileCompletionUseCase";
import { IDateTimeService } from "../../../domain/services/IDateTimeService";

export class GetPatientDashboardStatsUseCase {
    constructor(
        private readonly appointmentRepo: IAppointmentRepository,
        private readonly patientRepo: IPatientRepository,
        private readonly calculateProfileCompletionUseCase: CalculateProfileCompletionUseCase,
        private readonly dateTimeService: IDateTimeService
    ) {}

    async execute(userId: string) {
        const [appointments, patient] = await Promise.all([
            this.appointmentRepo.getAppointmentsByPatientId(userId),
            this.patientRepo.findById(userId)
        ]);

        const now = this.dateTimeService.now();
        const upcomingAppointments = appointments
            .filter(app => 
                this.dateTimeService.isTodayOrFuture(app.appointmentDate) && 
                app.status !== "CANCELLED" && 
                app.status !== "COMPLETED"
            )
            .sort((a, b) => {
                const dateA = this.dateTimeService.toDateTime(a.appointmentDate, a.slotStart);
                const dateB = this.dateTimeService.toDateTime(b.appointmentDate, b.slotStart);
                return dateA.getTime() - dateB.getTime();
            });
        const nextAppointment = upcomingAppointments.length > 0 ? upcomingAppointments[0] : null;

        const recentAppointments = appointments
            .filter(app => new Date(app.appointmentDate) < now || app.status === "CANCELLED" || app.status === "COMPLETED")
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 5);

        const profileCompletion = this.calculateProfileCompletionUseCase.execute(patient);

        return {
            upcomingAppointmentsCount: upcomingAppointments.length,
            nextAppointment: nextAppointment ? {
                id: nextAppointment.id,
                date: nextAppointment.appointmentDate,
                slotStart: nextAppointment.slotStart,
                doctorName: `Dr. ${nextAppointment.doctor?.firstName} ${nextAppointment.doctor.lastName}`,
                specialty: nextAppointment.doctor.specialization?.name || "General",
            } : null,
            recentAppointments: recentAppointments.map(app => ({
                id: app.id,
                doctorName: `Dr. ${app.doctor.firstName} ${app.doctor.lastName}`,
                specialty: app.doctor.specialization?.name || "General",
                date: app.appointmentDate,
                status: app.status,
            })),
            profileCompletion,
            medicalRecordsCount: 0, // Placeholder
        };
    }
}
