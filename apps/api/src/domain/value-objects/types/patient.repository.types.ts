import { UserStatus } from "../enums/UserStatus";
import { Gender } from "../enums/Gender";
import { PaginatedResponse, PaginationQuery } from "./pagination.types";

export interface PatientProfile {
  id: string;
  firstName: string;
  lastName: string;
  name?: string;
  email: string;
  phone: string;
  mobile?: string;
  dob?: Date;
  gender?: Gender;
  bloodGroup?: string;
  patientId: string;
  avatarUrl?: string;
  status: UserStatus;
  user: {
    id: string;
    email: string;
    status: UserStatus;
    createdAt: Date;
  };
  createdAt: Date;
  emergencyContacts?: EmergencyContact[];
  wallet?: {
    id: string;
    balance: number;
  };
}

export interface EmergencyContact {
  id?: string;
  name: string;
  mobile: string;
}

export interface PatientDashboardStats {
  appointmentsCount: number;
  upcomingAppointmentsCount: number;
  completedAppointmentsCount: number;
  profileCompletion: number;
}

export interface PatientListItem extends PatientProfile {
  appointmentsCount: number;
}

export interface PaginatedPatients extends PaginatedResponse<PatientListItem> {}

export interface PatientFilters extends PaginationQuery {
  status?: UserStatus;
  gender?: Gender;
}
