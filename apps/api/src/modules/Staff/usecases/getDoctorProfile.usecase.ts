import { IDoctorRepository } from "../interfaces/IDoctorRepository";

export class GetDoctorProfileUseCase {
  constructor(private doctorRepository: IDoctorRepository) {}

  async execute(userId: string) {
    return this.doctorRepository.getProfile(userId);
  }
}
