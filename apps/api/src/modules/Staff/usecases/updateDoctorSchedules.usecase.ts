import { IDoctorRepository } from "../interfaces/IDoctorRepository";

export class UpdateDoctorSchedulesUseCase {
  constructor(private doctorRepository: IDoctorRepository) {}

  async execute(userId: string, schedules: any[]) {
    return this.doctorRepository.updateSchedules(userId, schedules);
  }
}
