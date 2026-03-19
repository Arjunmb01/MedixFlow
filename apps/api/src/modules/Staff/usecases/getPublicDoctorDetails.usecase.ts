import { IDoctorRepository } from "../interfaces/IDoctorRepository";

export class GetPublicDoctorDetailsUseCase {
  constructor(private doctorRepository: IDoctorRepository) {}

  async execute(doctorId: string) {
    return this.doctorRepository.findProfileById(doctorId);
  }
}
