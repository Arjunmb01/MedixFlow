import { IDoctorRepository } from "@/domain/repositories/IDoctorRepository";

export class GetDoctorProfileUseCase {
  constructor(private doctorRepository: IDoctorRepository) {}

  async execute(userId: string) {
    return this.doctorRepository.getProfile(userId);
  }
}
