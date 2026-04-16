import { IDoctorLeaveRepository } from "@/domain/repositories/IDoctorLeaveRepository";
import { DoctorLeave } from "@/domain/entities/DoctorLeave";

export class GetMyLeavesUseCase {
  constructor(private readonly leaveRepository: IDoctorLeaveRepository) {}

  async execute(doctorId: string): Promise<DoctorLeave[]> {
    return this.leaveRepository.findByDoctor(doctorId);
  }
}
