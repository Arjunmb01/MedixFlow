import { IDoctorRepository } from "../interfaces/IDoctorRepository";

export interface GetDoctorsFilters {
  specialty?: string;
  search?: string;
  availableToday?: boolean;
  minFee?: number;
  maxFee?: number;
  skip?: number;
  take?: number;
}

export class GetAllDoctorsUseCase {
  constructor(private doctorRepository: IDoctorRepository) {}

  async execute(filters: GetDoctorsFilters) {
    return this.doctorRepository.getDoctorsFiltered(filters);
  }
}
