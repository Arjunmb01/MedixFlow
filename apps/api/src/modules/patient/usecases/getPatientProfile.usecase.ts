import { MESSAGES } from "../../../core/constants";
import { IPatientRepository } from "../interfaces/IPatientRepository";
import { calculateProfileCompletion } from "../services/ProfileCompletion.service";
import { PatientMapper } from "../mappers/PatientMapper";

export class GetPatientProfileUseCase {
  constructor(private patientRepository: IPatientRepository) {}

  async execute(patientId: string) {
    const patient: any = await this.patientRepository.findById(patientId);

    if (!patient) {
      throw new Error(MESSAGES.PATIENT_NOT_FOUND);
    }

    const completion = calculateProfileCompletion(patient);

    return PatientMapper.toProfile(patient, completion);
  }
}