import { IPatientRepository } from "@/domain/repositories/IPatientRepository";
import { IStaffRepository } from "@/domain/repositories/IStaffRepository";
import { ISessionService } from "@/application/interfaces/IAuthServices";
import { MESSAGES } from "@/shared/constants";
import { UserStatus } from "@/domain/value-objects/enums/UserStatus";

export class ToggleBlockPatientUseCase {
  constructor(
    private patientRepository: IPatientRepository,
    private sessionService: ISessionService
  ) {}

  async execute(id: string, status: UserStatus) {
    const result = await this.patientRepository.toggleBlock(id, status);

    if (status === UserStatus.SUSPENDED || status === UserStatus.INACTIVE) {
        await this.sessionService.deleteSession(id);
    }

    return result;
  }
}

export class DeletePatientUseCase {
  constructor(private patientRepository: IPatientRepository) {}

  async execute(id: string) {
    await this.patientRepository.deletePatient(id);
    return { message: MESSAGES.PATIENT_DELETED };
  }
}

export class GetPatientStatsUseCase {
  constructor(
    private patientRepository: IPatientRepository,
    private staffRepository: IStaffRepository
  ) {}

  async execute() {
    const [patientStats, staffStats] = await Promise.all([
      this.patientRepository.getStats(),
      this.staffRepository.getDoctors({ page: 1, limit: 1 })
    ]);

    return {
      patientCount: patientStats.total,
      doctorCount: staffStats.stats.total
    };
  }
}

