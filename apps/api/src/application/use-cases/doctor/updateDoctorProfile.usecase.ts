import { IDoctorProfileRepository } from "@/domain/repositories/IDoctorRepository";
import { DoctorProfile } from "@/domain/value-objects/types/doctor.repository.types";

export class UpdateDoctorProfileUseCase {
  constructor(private doctorRepository: IDoctorProfileRepository) {}

  async execute(userId: string, data: Partial<DoctorProfile>): Promise<DoctorProfile> {
    const existing = await this.doctorRepository.findById(userId);
    if (!existing) {
      throw new Error("Doctor profile not found");
    }
    return this.doctorRepository.updateProfile(userId, data);
  }
}
