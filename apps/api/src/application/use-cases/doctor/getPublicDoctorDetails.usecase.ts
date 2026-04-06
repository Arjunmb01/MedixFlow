import { IDoctorProfileRepository } from "@/domain/repositories/IDoctorRepository";
import { DoctorProfile } from "@/domain/value-objects/types/doctor.repository.types";

export class GetPublicDoctorDetailsUseCase {
  constructor(private doctorRepository: IDoctorProfileRepository) {}

  async execute(doctorId: string): Promise<DoctorProfile | null> {
    return this.doctorRepository.findProfileById(doctorId);
  }
}
