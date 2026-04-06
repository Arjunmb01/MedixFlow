import { IDoctorProfileRepository } from "@/domain/repositories/IDoctorRepository";
import { DoctorProfile } from "@/domain/value-objects/types/doctor.repository.types";

export class GetDoctorProfileUseCase {
  constructor(private doctorRepository: IDoctorProfileRepository) {}

  async execute(userId: string): Promise<DoctorProfile | null> {
    return this.doctorRepository.getProfile(userId);
  }
}
