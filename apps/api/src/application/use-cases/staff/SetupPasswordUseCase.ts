import { IStaffRepository } from "@/domain/repositories/IStaffRepository";
import { BusinessRuleError } from "@/domain/value-objects/errors/BaseDomainError";

export interface SetupPasswordUseCaseInput {
    token: string;
    password: string;
}

export class SetupPasswordUseCase {
    constructor(private readonly staffRepository: IStaffRepository) {}
    
    async execute(input: SetupPasswordUseCaseInput): Promise<void> {
        const { token, password } = input;
        
        if (!token || !password) {
            throw new BusinessRuleError("Token and password are required for setup.");
        }
        
        await this.staffRepository.setupPassword(token, password);
    }
}

