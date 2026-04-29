import { IDoctorLeaveRepository } from "@/domain/repositories/IDoctorLeaveRepository";
import { DoctorLeave } from "@/domain/entities/DoctorLeave";

export class GetAllLeavesUseCase {
  constructor(private readonly leaveRepository: IDoctorLeaveRepository) {}

  async execute(filters?: { status?: any; search?: string; page?: number; limit?: number }): Promise<{ leaves: DoctorLeave[]; total: number }> {
    return this.leaveRepository.findAll(filters);
  }
}
