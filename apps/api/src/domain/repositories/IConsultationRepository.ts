import { ConsultationStatus } from "../value-objects/enums/ConsultationStatus";

export interface CreateConsultationDTO {
  appointmentId: string;
  doctorId: string;
  patientId: string;
  parentConsultationId?: string;
  followUpExpiry?: Date;
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
  genericName?: string;
  dosage: string;
  frequency: string;
  morning: boolean;
  afternoon: boolean;
  night: boolean;
  duration: string;
  foodTiming: 'BEFORE_FOOD' | 'AFTER_FOOD' | 'WITH_FOOD' | 'EMPTY_STOMACH';
  instructions?: string;
  type: 'BRAND' | 'GENERIC';
}

export interface SavePrescriptionDTO {
  instructions?: string;
  medicines: MedicineDTO[];
}

export interface LabTestRequestDTO {
  testName: string;
  testType?: string;
  instructions?: string;
  fastingRequired: boolean;
  urgency?: 'NORMAL' | 'URGENT' | 'EMERGENCY';
}

export interface LabTestRecord {
  id: string;
  consultationId: string;
  testName: string;
  testType?: string | null;
  instructions?: string | null;
  fastingRequired: boolean;
  urgency: 'NORMAL' | 'URGENT' | 'EMERGENCY';
  status: 'PENDING' | 'UPLOADED' | 'REVIEWED';
  assignedBy?: string | null;
  reviewedBy?: string | null;
  reviewerComments?: string | null;
  isAbnormal: boolean;
  reports: LabReportRecord[];
  createdAt: Date;
  updatedAt: Date;
}

export interface LabReportRecord {
  id: string;
  labTestId: string;
  fileUrl: string;
  fileName: string;
  fileType?: string | null;
  uploadedAt: Date;
}

export interface FollowUpDTO {
  consultationId: string;
  patientId: string;
  doctorId: string;
  scheduledDate: Date;
  time: string;
  type: 'PHYSICAL' | 'VIDEO' | 'PHONE';
  reason?: string;
  notes?: string;
}

export interface FollowUpRecord {
  id: string;
  consultationId: string;
  patientId: string;
  doctorId: string;
  scheduledDate: Date;
  time: string;
  type: 'PHYSICAL' | 'VIDEO' | 'PHONE';
  status: 'SCHEDULED' | 'COMPLETED' | 'MISSED' | 'CANCELLED' | 'RESCHEDULED';
  reason?: string | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConsultationRecord {
  id: string;
  appointmentId: string;
  doctorId: string;
  patientId: string;
  status: ConsultationStatus | string;
  parentConsultationId?: string | null;
  followUpExpiry?: Date | null;
  createdAt: Date;
  startedAt?: Date | null;
  completedAt?: Date | null;
}

export interface ConsultationDraftDTO {
  vitals?: any;
  medicalRecord?: any;
  prescription?: any;
  labTests?: any;
}

export interface ConsultationWithDetails extends ConsultationRecord {
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    patientId: string;
    phone?: string | null;
    dob?: Date | null;
    gender?: string | null;
    bloodGroup?: string | null;
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
  followUp: FollowUpRecord | null;
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
    patientId: string;
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
    prescription?: SavePrescriptionDTO,
    userId?: string // For revision tracking
  ): Promise<ConsultationWithEMR>;
  getPatientHistory(patientId: string): Promise<ConsultationHistoryItem[]>;
  deleteByAppointmentId(appointmentId: string): Promise<void>;

  // Lab Test methods
  requestLabTests(consultationId: string, tests: LabTestRequestDTO[]): Promise<void>;
  getLabTestsByConsultation(consultationId: string): Promise<LabTestRecord[]>;
  uploadLabTestReport(labTestId: string, reportUrl: string): Promise<void>;
  reviewLabTest(labTestId: string, doctorId: string, comments?: string, isAbnormal?: boolean): Promise<void>;
  updateLabTestStatus(labTestId: string, status: 'PENDING' | 'UPLOADED' | 'REVIEWED'): Promise<void>;

  // Draft methods
  saveDraft(consultationId: string, draft: ConsultationDraftDTO): Promise<void>;
  getDraft(consultationId: string): Promise<ConsultationDraftDTO | null>;
  deleteDraft(consultationId: string): Promise<void>;

  // FollowUp methods
  scheduleFollowUp(data: FollowUpDTO): Promise<FollowUpRecord>;
  getFollowUpByConsultation(consultationId: string): Promise<FollowUpRecord | null>;
  getPatientFollowUps(patientId: string): Promise<FollowUpRecord[]>;
  updateFollowUpStatus(id: string, status: string): Promise<FollowUpRecord>;

  // Revision methods
  getRevisions(consultationId: string): Promise<any[]>;
}
