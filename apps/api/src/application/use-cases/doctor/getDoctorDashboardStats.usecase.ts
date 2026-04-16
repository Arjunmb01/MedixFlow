import { IDoctorStatsRepository } from "@/domain/repositories/IDoctorRepository";
import { DoctorDashboardStats } from "@/domain/value-objects/types/doctor.repository.types";
import { IDateTimeService } from "@/domain/services/IDateTimeService";

export class GetDoctorDashboardStatsUseCase {
  constructor(
    private doctorRepository: IDoctorStatsRepository,
    private dateTimeService: IDateTimeService
  ) {}

  async execute(userId: string): Promise<DoctorDashboardStats> {
    const raw = await this.doctorRepository.getRawStats(userId, this.dateTimeService.now());
    
    // Sort logic moved from repository to Use Case (SRP)
    const sortedTodayAppointments = raw.todayAppointments
        .sort((a, b) => {
            const getStatusPriority = (apt: any) => {
                if (apt.consultation?.status === "IN_PROGRESS") return 3;
                if (apt.consultation?.status === "WAITING") return 2;
                if (apt.consultation?.status === "COMPLETED") return 1;
                return 0;
            };

            const priorityA = getStatusPriority(a);
            const priorityB = getStatusPriority(b);

            if (priorityA !== priorityB) return priorityB - priorityA;
            return a.slotStart.localeCompare(b.slotStart);
        });

    return {
        totalAppointments: raw.totalAppointments,
        completedAppointments: raw.completedAppointments,
        pendingAppointments: raw.pendingAppointments,
        totalPatients: raw.uniquePatientsCount,
        todayAppointments: sortedTodayAppointments.map(apt => ({
            id: apt.id,
            patientId: apt.patientId,
            patient: {
                id: apt.patient.id,
                patientId: apt.patient.patientId,
                firstName: apt.patient.firstName,
                lastName: apt.patient.lastName,
                gender: apt.patient.gender
            },
            slotStart: apt.slotStart,
            slotEnd: apt.slotEnd,
            status: apt.status,
            appointmentDate: apt.appointmentDate,
            isCheckedIn: !!apt.consultation,
            consultationId: apt.consultation?.id,
            consultationStatus: apt.consultation?.status
        })),
        todayAppointmentsCount: raw.todayAppointments.length,
        pendingToday: raw.todayAppointments.filter((a: any) => ["PENDING", "CONFIRMED"].includes(a.status)).length,
        completedToday: raw.todayAppointments.filter((a: any) => a.status === "COMPLETED").length,
        totalEarnings: raw.totalEarnings,
        dashboardDate: raw.dashboardDate
    };
  }
}