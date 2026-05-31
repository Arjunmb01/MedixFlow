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
