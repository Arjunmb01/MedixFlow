import { DoctorLeave, LeaveStatus } from "../entities/DoctorLeave";

export interface CreateLeaveInput {
  startDate: Date;
  endDate: Date;
  reason: string;
}

export interface ReviewLeaveInput {
  status: LeaveStatus.APPROVED | LeaveStatus.REJECTED;
}

export interface IDoctorLeaveRepository {
  create(doctorId: string, data: CreateLeaveInput): Promise<DoctorLeave>;
  findByDoctor(doctorId: string): Promise<DoctorLeave[]>;
  findAll(filters?: { status?: LeaveStatus; search?: string; page?: number; limit?: number }): Promise<{ leaves: DoctorLeave[]; total: number }>;
  findById(id: string): Promise<DoctorLeave | null>;
  update(id: string, data: Partial<{ status: LeaveStatus }>): Promise<DoctorLeave>;
  cancel(id: string, doctorId: string): Promise<DoctorLeave>;
}
