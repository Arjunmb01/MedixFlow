export interface CreateConsultationDTO {
  appointmentId: string;
  doctorId: string;
  patientId: string;
}

export interface CompleteConsultationDTO {
  consultationId: string;
  symptoms: string;
  diagnosis: string;
  notes?: string;

  bp?: string;
  hr?: number;
  temp?: number;
  weight?: number;

  instructions?: string;

  medicines: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
  }[];
}