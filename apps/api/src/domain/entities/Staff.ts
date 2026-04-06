import { Role } from "../value-objects/enums/Role";
import { UserStatus } from "../value-objects/enums/UserStatus";

export interface CreateDoctorPayload {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    specialty: string;
    consultationFee: number;
    licenseNumber: string;
    schedules: {
        dayOfWeek: number;
        startTime: string;
        endTime: string;
        fullDay: boolean;
        slotDurationMinutes: number;
    }[];
}

export interface GetDoctorsQuery {
    search?: string;
    specialty?: string;
    status?: UserStatus;
    page?: number;
    limit?: number;
}

export class Staff {
  constructor(
    public readonly id: string,
    public email: string,
    public role: Role,
    public status: UserStatus
  ) {}

  public validateStatus(): boolean {
    return this.status === UserStatus.ACTIVE;
  }

  public block(): void {
    this.status = UserStatus.SUSPENDED;
  }

  public activate(): void {
    this.status = UserStatus.ACTIVE;
  }
}
