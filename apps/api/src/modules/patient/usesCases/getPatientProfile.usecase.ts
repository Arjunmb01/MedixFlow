import { PatientRepository } from "../repostries/patient.repository";
import { calculateProfileCompletion } from "../services/ProfileCompletion.service";
import { PatientProfile } from "../types/patient.types";

export class GetPatientProfileUseCase {

  constructor(private repo: PatientRepository) {}

  async execute(patientId: string) {

    const patientData = await this.repo.findById(patientId);

    if (!patientData) {
      throw new Error("Patient not found");
    }

    const patient: PatientProfile = {
      id: patientData.id,
      patientId: patientData.patientId,
      name: `${patientData.firstName} ${patientData.lastName}`,
      email: patientData.user.email,
      mobile: patientData.phone,
      bloodGroup: patientData.bloodGroup,
      emergencyContacts: patientData.emergencyContacts.map(c => ({
        id: c.id,
        name: c.name,
        mobile: c.mobile
      }))
    };

    const profileCompletion = calculateProfileCompletion(patient);

    return {
      ...patient,
      profileCompletion
    };
  }
}