import { IDoctorRepository } from "@/domain/repositories/IDoctorRepository";

export class GetPublicDoctorDetailsUseCase {
  constructor(private doctorRepository: IDoctorRepository) {}

  async execute(doctorId: string) {
    return this.doctorRepository.findProfileById(doctorId);
  }
}
