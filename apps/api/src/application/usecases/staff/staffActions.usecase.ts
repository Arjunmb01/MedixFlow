import { IStaffRepository } from "@/domain/repositories/IStaffRepository";
import { IEmailService } from "@/domain/services/IEmailService";
import { ISessionService } from "@/domain/services/IAuthServices";
import { MESSAGES } from "@/shared/constants";
import { randomBytes } from "crypto";
import { UserStatus } from "@prisma/client";

export class GetDoctorsUseCase {
  constructor(private staffRepository: IStaffRepository) {}
  async execute(query: any) {
    return this.staffRepository.getDoctors(query);
  }
}

export class CreateDoctorUseCase {
  constructor(
    private staffRepository: IStaffRepository,
    private emailService: IEmailService
  ) {}

  async execute(data: any, host: string, protocol: string) {
    const tempPassword = randomBytes(4).toString('hex');
    const result = await this.staffRepository.createDoctor(data, tempPassword);
    
    // Send email
    try {
        await this.emailService.sendDoctorCredentialsEmail(
            data.email,
            data.firstName,
            tempPassword
        );
    } catch (error) {
        console.error("Failed to send welcome email:", error);
    }

    const setupLink = `${protocol}://${host === 'localhost:5000' ? 'localhost:5173' : host}/setup-password?token=${result.setupToken.token}`;

    return {
        message: MESSAGES.STAFF_CREATED,
        data: {
            ...result.user,
            temporaryPassword: tempPassword
        },
        setupLink
    };
  }
}

export class UpdateStaffDoctorUseCase {
    constructor(private staffRepository: IStaffRepository) {}
    async execute(id: string, data: any) {
        const doctor = await this.staffRepository.updateDoctor(id, data);
        return { message: MESSAGES.STAFF_UPDATED, data: doctor };
    }
}

export class BlockDoctorUseCase {
    constructor(
        private staffRepository: IStaffRepository,
        private sessionService: ISessionService
    ) {}

    async execute(id: string, status: UserStatus) {
        const doctor = await this.staffRepository.blockDoctor(id, status);
        if (status === "SUSPENDED" || status === "INACTIVE") {
            await this.sessionService.deleteSession(id);
        }
        return { message: MESSAGES.STAFF_STATUS_UPDATED, data: doctor };
    }
}

export class DeleteDoctorUseCase {
    constructor(private staffRepository: IStaffRepository) {}
    async execute(id: string) {
        await this.staffRepository.deleteDoctor(id);
        return { message: MESSAGES.STAFF_DELETED };
    }
}

export class SetupPasswordUseCase {
    constructor(private staffRepository: IStaffRepository) {}
    async execute(token: string, password: string) {
        if (!token || !password) {
            throw new Error(MESSAGES.TOKEN_PASSWORD_REQUIRED);
        }
        await this.staffRepository.setupPassword(token, password);
        return { message: MESSAGES.PASSWORD_SETUP_SUCCESS };
    }
}
