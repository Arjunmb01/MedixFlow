import { IDoctorRepository } from "@/domain/repositories/IDoctorRepository";
import { DoctorSchedule } from "@/domain/value-objects/types/doctor.repository.types";

export class UpdateDoctorSchedulesUseCase {
  constructor(private doctorRepository: IDoctorRepository) {}

  async execute(userId: string, schedules: DoctorSchedule[]): Promise<void> {
    return this.doctorRepository.updateSchedules(userId, schedules);
  }
}
