import { IDoctorMedicalRepository } from "@/domain/repositories/IDoctorRepository";
import { PrescriptionRecord } from "@/domain/value-objects/types/doctor.repository.types";

export interface UpdatePrescriptionUseCaseInput {
    id: string;
    instructions?: string;
    medicines: {
        name: string;
        dosage: string;
        frequency: string;
        duration: string;
    }[];
}

export class UpdatePrescriptionUseCase {
  constructor(private readonly doctorRepo: IDoctorMedicalRepository) {}

  async execute(input: UpdatePrescriptionUseCaseInput): Promise<PrescriptionRecord> {
    const { id, ...data } = input;
    return await this.doctorRepo.updatePrescription(id, data);
  }
}
