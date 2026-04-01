import { MESSAGES } from "@/shared/constants";
import { IPatientRepository } from "@/domain/repositories/IPatientRepository";
import { PatientMapper } from "@/application/dto/mappers/PatientMapper";
import { CalculateProfileCompletionUseCase } from "./CalculateProfileCompletionUseCase";
import { PatientProfile } from "@/domain/value-objects/types/patient.repository.types";

export class UpdatePatientProfileUseCase {
  constructor(
    private patientRepository: IPatientRepository,
    private calculateProfileCompletionUseCase: CalculateProfileCompletionUseCase
  ) {}


  async execute(patientId: string, data: Partial<PatientProfile>): Promise<PatientProfile & { profileCompletion: number }> {
    const existingPatient = await this.patientRepository.findById(patientId);

    if (!existingPatient) {
      throw new Error(MESSAGES.PATIENT_NOT_FOUND);
    }

    await this.patientRepository.updatePatient(patientId, data);

    const profile = await this.patientRepository.findById(patientId);
    if (!profile) throw new Error(MESSAGES.PATIENT_NOT_FOUND);

    const completion = this.calculateProfileCompletionUseCase.execute(profile);
    
    return {
      ...PatientMapper.toProfile(profile, completion),
      profileCompletion: completion
    };
  }
}

