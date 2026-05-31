import { IStaffRepository } from "@/domain/repositories/IStaffRepository";
import { ISessionService } from "@/application/interfaces/IAuthServices";
import { UserStatus } from "@/domain/value-objects/enums/UserStatus";
import { UserRole } from "@/domain/value-objects/enums/UserRole";

export interface BlockDoctorUseCaseInput {
    id: string;
    status: UserStatus;
}

export class BlockDoctorUseCase {
    constructor(
        private readonly staffRepository: IStaffRepository,
        private readonly sessionService: ISessionService
    ) {}

    async execute(input: BlockDoctorUseCaseInput): Promise<void> {
        const { id, status } = input;
        await this.staffRepository.blockDoctor(id, status);
        
        if (status === UserStatus.SUSPENDED || status === UserStatus.INACTIVE) {
            await this.sessionService.deleteSession(id, UserRole.DOCTOR);
        }
    }
}

