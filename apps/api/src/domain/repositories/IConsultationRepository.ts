import { ConsultationStatus } from "../value-objects/enums/ConsultationStatus";

export interface CreateConsultationDTO {
  appointmentId: string;
  doctorId: string;
  patientId: string;
}

export interface SaveVitalsDTO {
  bloodPressure?: string;
  heartRate?: number;
  temperature?: number;
  weight?: number;
}

export interface SaveMedicalRecordDTO {
  symptoms: string;
  diagnosis: string;
  notes?: string;
  planForManagement?: string;
}

export interface MedicineDTO {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface SavePrescriptionDTO {
  instructions?: string;
  medicines: MedicineDTO[];
}

export interface LabTestRequestDTO {
  testName: string;
}

export interface LabTestRecord {
  id: string;
  consultationId: string;
  testName: string;
  status: 'PENDING' | 'UPLOADED';
  reportUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConsultationRecord {
  id: string;
  appointmentId: string;
  doctorId: string;
  patientId: string;
  status: ConsultationStatus | string;
  createdAt: Date;
  startedAt?: Date | null;
  completedAt?: Date | null;
}

export interface ConsultationWithDetails extends ConsultationRecord {
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    phone?: string | null;
  };
  doctor: {
    id: string;
    firstName: string;
    lastName: string;
    specialization: { name: string } | null;
  };
  vitals: {
    bloodPressure?: string | null;
    heartRate?: number | null;
    temperature?: number | null;
    weight?: number | null;
  }[];
  medicalRecord: {
    symptoms: string;
    diagnosis: string;
    notes?: string | null;
    planForManagement?: string | null;
  } | null;
  prescription: {
    id: string;
    instructions?: string | null;
    medicines: MedicineDTO[];
  } | null;
  labTests: LabTestRecord[];
  appointment: {
    id: string;
    appointmentDate: Date;
    slotStart: string;
    slotEnd: string;
  };
}

export interface ConsultationQueueItem extends ConsultationRecord {
  patient: {
    id: string;
    firstName: string;
    lastName: string;
  };
  appointment: {
    id: string;
    appointmentDate: Date;
    slotStart: string;
    slotEnd: string;
  };
}

export interface ConsultationHistoryItem extends ConsultationRecord {
  vitals: {
    bloodPressure?: string | null;
    heartRate?: number | null;
    temperature?: number | null;
    weight?: number | null;
  }[];
  medicalRecord: {
    symptoms: string;
    diagnosis: string;
    notes?: string | null;
    planForManagement?: string | null;
  } | null;
  prescription: {
    id: string;
    instructions?: string | null;
    medicines: MedicineDTO[];
  } | null;
  labTests: LabTestRecord[];
  appointment: {
    id: string;
    appointmentDate: Date;
    slotStart: string;
    slotEnd: string;
  };
  doctor: {
    id: string;
    firstName: string;
    lastName: string;
    specialization: { name: string } | null;
  };
}

export interface ConsultationWithEMR extends ConsultationRecord {
  vitals: {
    bloodPressure?: string | null;
    heartRate?: number | null;
    temperature?: number | null;
    weight?: number | null;
  }[];
  medicalRecord: {
    symptoms: string;
    diagnosis: string;
    notes?: string | null;
    planForManagement?: string | null;
  } | null;
  prescription: {
    id: string;
    instructions?: string | null;
    medicines: MedicineDTO[];
  } | null;
  labTests: LabTestRecord[];
}

// ─── Repository contract ──────────────────────────────────────────────────
export interface IConsultationRepository {
  create(data: CreateConsultationDTO): Promise<ConsultationRecord>;
  findById(id: string): Promise<ConsultationWithDetails | null>;
  findByAppointmentId(appointmentId: string): Promise<ConsultationWithEMR | null>;
  getDoctorQueue(doctorId: string, date: Date): Promise<ConsultationQueueItem[]>;
  updateStatus(id: string, status: ConsultationStatus | string): Promise<ConsultationRecord>;
  saveConsultationData(
    id: string,
    vitals?: SaveVitalsDTO,
    medicalRecord?: SaveMedicalRecordDTO,
    prescription?: SavePrescriptionDTO
  ): Promise<ConsultationWithEMR>;
  getPatientHistory(patientId: string): Promise<ConsultationHistoryItem[]>;
  deleteByAppointmentId(appointmentId: string): Promise<void>;

  // Lab Test methods
  requestLabTests(consultationId: string, tests: LabTestRequestDTO[]): Promise<void>;
  getLabTestsByConsultation(consultationId: string): Promise<LabTestRecord[]>;
  uploadLabTestReport(labTestId: string, reportUrl: string): Promise<void>;
}
