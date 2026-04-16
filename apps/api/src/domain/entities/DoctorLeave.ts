export enum LeaveStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export class DoctorLeave {
  constructor(
    public readonly id: string,
    public readonly doctorId: string,
    public startDate: Date,
    public endDate: Date,
    public reason: string,
    public status: LeaveStatus,
    public readonly createdAt: Date,
    public updatedAt: Date
  ) {}

  approve(): void {
    if (this.status !== LeaveStatus.PENDING) {
      throw new Error("Only PENDING leaves can be approved.");
    }
    this.status = LeaveStatus.APPROVED;
    this.updatedAt = new Date();
  }

  reject(): void {
    if (this.status !== LeaveStatus.PENDING) {
      throw new Error("Only PENDING leaves can be rejected.");
    }
    this.status = LeaveStatus.REJECTED;
    this.updatedAt = new Date();
  }

  cancel(): void {
    if (this.status !== LeaveStatus.PENDING) {
      throw new Error("Only PENDING leaves can be cancelled.");
    }
    this.status = LeaveStatus.REJECTED;
    this.updatedAt = new Date();
  }

  overlaps(startDate: Date, endDate: Date): boolean {
    return this.startDate <= endDate && this.endDate >= startDate;
  }
}
