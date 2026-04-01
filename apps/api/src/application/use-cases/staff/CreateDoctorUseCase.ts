import { IStaffRepository } from "@/domain/repositories/IStaffRepository";
import { IEmailService } from "@/application/interfaces/IEmailService";
import { randomBytes } from "crypto";

import { 
    CreateDoctorInput, 
    UpdateDoctorInput, 
    StaffDoctorListItem 
} from "@/domain/value-objects/types/staff.repository.types";

export interface CreateDoctorUseCaseOutput {
    user: StaffDoctorListItem;
    temporaryPassword: string;
    setupToken: string;
}

export class CreateDoctorUseCase {
  constructor(
    private readonly staffRepository: IStaffRepository,
    private readonly emailService: IEmailService
  ) {}

  async execute(input: CreateDoctorInput): Promise<CreateDoctorUseCaseOutput> {
    const tempPassword = randomBytes(4).toString('hex');
    const result = await this.staffRepository.createDoctor(input, tempPassword);
    
    // Send email
    try {
        await this.emailService.sendDoctorCredentialsEmail(
            input.email,
            input.firstName,
            tempPassword
        );
    } catch (error: unknown) {
        console.error("Failed to send welcome email:", error);
    }

    return {
        user: result.user,
        temporaryPassword: tempPassword,
        setupToken: result.setupToken
    };
  }
}

