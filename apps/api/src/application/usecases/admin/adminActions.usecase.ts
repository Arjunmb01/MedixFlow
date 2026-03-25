import { IPatientRepository } from "@/domain/repositories/IPatientRepository";
import { ISessionService } from "@/domain/services/IAuthServices";
import { MESSAGES } from "@/shared/constants";

export class ToggleBlockPatientUseCase {
  constructor(
    private patientRepository: IPatientRepository,
    private sessionService: ISessionService
  ) {}

  async execute(id: string, status: string) {
    const result = await this.patientRepository.toggleBlock(id, status);

    if (status === "INACTIVE" || status === "SUSPENDED") {
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
  constructor(private patientRepository: IPatientRepository) {}

  async execute() {
    return this.patientRepository.getStats();
  }
}
