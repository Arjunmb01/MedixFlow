import { MESSAGES } from "@/shared/constants";
import { IPatientRepository } from "@/domain/repositories/IPatientRepository";
import { CalculateProfileCompletionUseCase } from "./CalculateProfileCompletionUseCase";
import { PatientMapper } from "@/application/dto/mappers/PatientMapper";
import { PatientProfile } from "@/domain/value-objects/types/patient.repository.types";

export class GetPatientProfileUseCase {
  constructor(
    private patientRepository: IPatientRepository,
    private calculateProfileCompletionUseCase: CalculateProfileCompletionUseCase
  ) {}


  async execute(patientId: string): Promise<PatientProfile & { profileCompletion: number }> {
    const patient = await this.patientRepository.findById(patientId);
    if (!patient) {
      throw new Error(MESSAGES.PATIENT_NOT_FOUND);
    }

    const completion = this.calculateProfileCompletionUseCase.execute(patient);

    return {
      ...PatientMapper.toProfile(patient, completion),
      profileCompletion: completion
    };
  }
}

