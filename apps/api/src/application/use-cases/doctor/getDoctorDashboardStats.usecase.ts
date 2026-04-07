import { IDoctorStatsRepository } from "@/domain/repositories/IDoctorRepository";
import { DoctorDashboardStats } from "@/domain/value-objects/types/doctor.repository.types";

export class GetDoctorDashboardStatsUseCase {
  constructor(
    private doctorRepository: IDoctorStatsRepository
  ) {}

  async execute(userId: string): Promise<DoctorDashboardStats> {
    return this.doctorRepository.getDashboardStats(userId, new Date());
  }
}