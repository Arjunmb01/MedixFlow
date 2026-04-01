import { IDoctorRepository } from "@/domain/repositories/IDoctorRepository";
import { PrescriptionRecord } from "@/domain/value-objects/types/doctor.repository.types";

export class GetDoctorPrescriptionsUseCase {
  constructor(private readonly doctorRepo: IDoctorRepository) {}

  async execute(doctorId: string): Promise<PrescriptionRecord[]> {
    return await this.doctorRepo.getDoctorPrescriptions(doctorId);
  }
}
