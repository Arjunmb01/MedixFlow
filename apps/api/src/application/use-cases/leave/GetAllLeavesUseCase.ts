import { IDoctorLeaveRepository } from "@/domain/repositories/IDoctorLeaveRepository";
import { DoctorLeave } from "@/domain/entities/DoctorLeave";

export class GetAllLeavesUseCase {
  constructor(private readonly leaveRepository: IDoctorLeaveRepository) {}

  async execute(): Promise<DoctorLeave[]> {
    return this.leaveRepository.findAll();
  }
}
