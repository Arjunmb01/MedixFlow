import { IDoctorLeaveRepository } from "@/domain/repositories/IDoctorLeaveRepository";
import { DoctorLeave } from "@/domain/entities/DoctorLeave";

export class CancelLeaveUseCase {
  constructor(private readonly leaveRepository: IDoctorLeaveRepository) {}

  async execute(leaveId: string, doctorId: string): Promise<DoctorLeave> {
    const leave = await this.leaveRepository.findById(leaveId);

    if (!leave) {
      throw new Error("Leave request not found.");
    }
    if (leave.doctorId !== doctorId) {
      throw new Error("Unauthorized: This leave does not belong to you.");
    }

    return this.leaveRepository.cancel(leaveId, doctorId);
  }
}
