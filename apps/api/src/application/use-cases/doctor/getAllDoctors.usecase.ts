import { IDoctorRepository } from "@/domain/repositories/IDoctorRepository";
import { DoctorFilters, PaginatedDoctors } from "@/domain/value-objects/types/doctor.repository.types";

export interface GetDoctorsFilters extends DoctorFilters {
  page: number;
  limit: number;
}

export class GetAllDoctorsUseCase {
  constructor(private doctorRepository: IDoctorRepository) {}

  async execute(filters: GetDoctorsFilters): Promise<PaginatedDoctors> {
    return this.doctorRepository.getDoctorsFiltered(filters);
  }
}
