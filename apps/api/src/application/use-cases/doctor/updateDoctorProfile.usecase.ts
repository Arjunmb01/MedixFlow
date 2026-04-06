import { IDoctorProfileRepository } from "@/domain/repositories/IDoctorRepository";
import { DoctorProfile } from "@/domain/value-objects/types/doctor.repository.types";

export class UpdateDoctorProfileUseCase {
  constructor(private doctorRepository: IDoctorProfileRepository) {}

  async execute(userId: string, data: Partial<DoctorProfile>): Promise<DoctorProfile> {
    return this.doctorRepository.updateProfile(userId, data);
  }
}
