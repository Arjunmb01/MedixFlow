import { IDoctorLeaveRepository } from "@/domain/repositories/IDoctorLeaveRepository";
import { DoctorLeave, LeaveStatus } from "@/domain/entities/DoctorLeave";

export interface ReviewLeaveInput {
  status: LeaveStatus.APPROVED | LeaveStatus.REJECTED;
}

export class ReviewLeaveUseCase {
  constructor(private readonly leaveRepository: IDoctorLeaveRepository) {}

  async execute(leaveId: string, input: ReviewLeaveInput): Promise<DoctorLeave> {
    const leave = await this.leaveRepository.findById(leaveId);

    if (!leave) {
      throw new Error("Leave request not found.");
    }
    if (leave.status !== LeaveStatus.PENDING) {
      throw new Error("Only PENDING leave requests can be reviewed.");
    }
    if (![LeaveStatus.APPROVED, LeaveStatus.REJECTED].includes(input.status)) {
      throw new Error("Invalid status. Must be APPROVED or REJECTED.");
    }

    return this.leaveRepository.update(leaveId, { status: input.status });
  }
}
