import { IDoctorProfileRepository } from "@/domain/repositories/IDoctorRepository";
import { DoctorSchedule } from "@/domain/value-objects/types/doctor.repository.types";

export class UpdateDoctorSchedulesUseCase {
  constructor(private doctorRepository: IDoctorProfileRepository) {}

  async execute(userId: string, schedules: DoctorSchedule[]): Promise<void> {
    for (const schedule of schedules) {
      if (schedule.startTime >= schedule.endTime) {
        throw new Error(`Invalid schedule for day ${schedule.dayOfWeek}: Start time must be before end time`);
      }
      // Simple format check (HH:mm)
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(schedule.startTime) || !timeRegex.test(schedule.endTime)) {
        throw new Error(`Invalid time format for day ${schedule.dayOfWeek}. Use HH:mm`);
      }
    }
    return this.doctorRepository.updateSchedules(userId, schedules);
  }
}
