import { MESSAGES } from "../../../core/constants";
import { IPatientRepository } from "../interfaces/IPatientRepository"
import { UpdatePatientInput } from "../types/patient.types"
import { PatientMapper } from "../mappers/PatientMapper";
import { calculateProfileCompletion } from "../services/ProfileCompletion.service";

export class UpdatePatientProfileUseCase {
  constructor(private patientRepository: IPatientRepository) {}

  async execute(patientId: string, data: UpdatePatientInput) {
    const existingPatient = await this.patientRepository.findById(patientId)

    if (!existingPatient) {
      throw new Error(MESSAGES.PATIENT_NOT_FOUND)
    }

    const updatedPatient: any = await this.patientRepository.updatePatient(
      patientId,
      data
    )

    // Re-fetch with relations or ensures return object has all fields needed for mapper
    const profile = await this.patientRepository.findById(patientId);
    if (!profile) throw new Error(MESSAGES.PATIENT_NOT_FOUND);

    const completion = calculateProfileCompletion(profile);
    
    return PatientMapper.toProfile(profile, completion);
  }
}