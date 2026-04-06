import { IStaffRepository } from "@/domain/repositories/IStaffRepository";
import { StaffDoctorFilters, PaginatedStaffDoctors } from "@/domain/value-objects/types/staff.repository.types";
import { UserStatus } from "@/domain/value-objects/enums/UserStatus";

export interface GetDoctorsUseCaseInput {
    search?: string;
    status?: UserStatus;
    specialty?: string;
    page?: number;
    limit?: number;
}

export class GetDoctorsUseCase {
  constructor(private readonly staffRepository: IStaffRepository) {}
  
  async execute(input: GetDoctorsUseCaseInput): Promise<PaginatedStaffDoctors> {
    const { page = 1, limit = 10, ...filters } = input;
    return await this.staffRepository.getDoctors({ ...filters, page, limit });
  }
}

