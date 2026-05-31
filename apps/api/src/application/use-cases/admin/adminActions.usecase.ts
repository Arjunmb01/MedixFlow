import { IPatientRepository } from "@/domain/repositories/IPatientRepository";
import { IStaffRepository } from "@/domain/repositories/IStaffRepository";
import { ISessionService } from "@/application/interfaces/IAuthServices";
import { MESSAGES } from "@/shared/constants";
import { UserStatus } from "@/domain/value-objects/enums/UserStatus";
import { UserRole } from "@/domain/value-objects/enums/UserRole";

export class ToggleBlockPatientUseCase {
  constructor(
    private patientRepository: IPatientRepository,
    private sessionService: ISessionService
  ) {}

  async execute(id: string, status: UserStatus) {
    const result = await this.patientRepository.toggleBlock(id, status);

    if (status === UserStatus.SUSPENDED || status === UserStatus.INACTIVE) {
        await this.sessionService.deleteSession(id, UserRole.PATIENT);
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
    const [patientStats, doctorCount] = await Promise.all([
      this.patientRepository.getStats(),
      this.staffRepository.getDoctorCount()
    ]);

    return {
      patientCount: patientStats.total,
      doctorCount
    };
  }
}

