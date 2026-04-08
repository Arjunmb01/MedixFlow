import { 
  PatientProfile, 
  EmergencyContact, 
  PaginatedPatients, 
  PatientFilters 
} from "../value-objects/types/patient.repository.types";
import { Patient } from "../entities/Patient";
import { UserStatus } from "../value-objects/enums/UserStatus";

export interface IPatientRepository {
  findById(id: string): Promise<Patient | null>;
  updatePatient(id: string, data: Partial<PatientProfile>): Promise<Patient>;
  updatePassword(id: string, passwordHash: string): Promise<void>;
  replaceEmergencyContacts(patientId: string, contacts: EmergencyContact[]): Promise<void>;
  getPatients(query: PatientFilters & { page: number; limit: number }): Promise<PaginatedPatients>;
  toggleBlock(userId: string, status: UserStatus): Promise<void>;
  deletePatient(userId: string): Promise<void>;
  getStats(): Promise<{ total: number; active: number; blocked: number }>;
}
