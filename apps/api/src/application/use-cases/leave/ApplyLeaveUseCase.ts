import { IDoctorLeaveRepository, CreateLeaveInput } from "@/domain/repositories/IDoctorLeaveRepository";
import { DoctorLeave } from "@/domain/entities/DoctorLeave";

export class ApplyLeaveUseCase {
  constructor(private readonly leaveRepository: IDoctorLeaveRepository) {}

  async execute(doctorId: string, input: CreateLeaveInput): Promise<DoctorLeave> {
    const startDate = new Date(input.startDate);
    const endDate = new Date(input.endDate);

    if (startDate > endDate) {
      throw new Error("Start date must be before or equal to end date.");
    }
    if (startDate < new Date(new Date().setHours(0, 0, 0, 0))) {
      throw new Error("Cannot apply for leave in the past.");
    }
    if (!input.reason || input.reason.trim().length < 5) {
      throw new Error("Please provide a valid reason (min 5 characters).");
    }

    return this.leaveRepository.create(doctorId, { startDate, endDate, reason: input.reason.trim() });
  }
}
