import { IDoctorRepository } from "@/domain/repositories/IDoctorRepository";

export class UpdateDoctorProfileUseCase {
  constructor(private doctorRepository: IDoctorRepository) {}

  async execute(userId: string, data: any) {
    return this.doctorRepository.updateProfile(userId, data);
  }
}
