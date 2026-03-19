import { IDoctorRepository } from "../interfaces/IDoctorRepository";

export class GetDoctorDashboardStatsUseCase {
  constructor(private doctorRepository: IDoctorRepository) {}

  async execute(userId: string) {
    return this.doctorRepository.getDashboardStats(userId);
  }
}
