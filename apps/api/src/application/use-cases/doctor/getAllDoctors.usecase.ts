import { IDoctorStatsRepository } from "@/domain/repositories/IDoctorRepository";
import { DoctorFilters, PaginatedDoctors } from "@/domain/value-objects/types/doctor.repository.types";

export class GetAllDoctorsUseCase {
  constructor(private doctorRepository: IDoctorStatsRepository) {}

  async execute(filters: DoctorFilters): Promise<PaginatedDoctors> {
    return this.doctorRepository.getDoctorsFiltered(filters);
  }
}
