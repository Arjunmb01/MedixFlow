import { IStaffRepository } from "@/domain/repositories/IStaffRepository";

export class DeleteDoctorUseCase {
    constructor(private readonly staffRepository: IStaffRepository) {}
    
    async execute(id: string): Promise<void> {
        await this.staffRepository.deleteDoctor(id);
    }
}
