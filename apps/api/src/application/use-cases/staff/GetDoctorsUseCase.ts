import { IStaffRepository } from "@/domain/repositories/IStaffRepository";
import { StaffDoctorFilters, PaginatedStaffDoctors } from "@/domain/value-objects/types/staff.repository.types";
import { UserStatus } from "@/domain/value-objects/enums/UserStatus";

export interface GetDoctorsUseCaseInput extends StaffDoctorFilters {}

export class GetDoctorsUseCase {
  constructor(private readonly staffRepository: IStaffRepository) {}
  
  async execute(input: GetDoctorsUseCaseInput): Promise<PaginatedStaffDoctors> {
    return await this.staffRepository.getDoctors(input);
  }
}

