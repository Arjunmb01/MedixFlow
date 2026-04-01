import { IStaffRepository } from "@/domain/repositories/IStaffRepository";
import { UpdateDoctorInput, StaffDoctorListItem } from "@/domain/value-objects/types/staff.repository.types";

export interface UpdateStaffDoctorUseCaseInput {
    id: string;
    data: UpdateDoctorInput;
}

export class UpdateStaffDoctorUseCase {
    constructor(private readonly staffRepository: IStaffRepository) {}
    
    async execute(input: UpdateStaffDoctorUseCaseInput): Promise<StaffDoctorListItem> {
        const { id, data } = input;
        return await this.staffRepository.updateDoctor(id, data);
    }
}
