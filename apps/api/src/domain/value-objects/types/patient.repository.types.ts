import { Patient } from "../../entities/Patient";
import { UserStatus, Gender } from "@prisma/client";

export interface PatientProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
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

export interface PaginatedPatients {
  data: any[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface PatientFilters {
  search?: string;
  status?: UserStatus;
  gender?: Gender;
}
