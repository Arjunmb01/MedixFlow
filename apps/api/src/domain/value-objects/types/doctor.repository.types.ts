import { Doctor } from "../../entities/Doctor";
import { PaginatedResponse, PaginationQuery } from "./pagination.types";

export interface DoctorProfile {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    licenseNumber: string;
    specialty: string;
    consultationFee: number;
    status: string;
    bio?: string;
    avatarUrl?: string;
    experienceYears?: number;
    languages?: string[];
    schedules?: DoctorSchedule[];
}

export interface AppointmentPreview {
    id: string;
    patientId: string;
    patient: {
        id: string;
        patientId: string;
        firstName: string;
        lastName: string;
        gender: string | null;
    };
    slotStart: string;
    slotEnd: string;
    status: string;
    appointmentDate: Date;

    isCheckedIn: boolean;
    consultationId?: string;
    consultationStatus?: string;
}

export interface DoctorDashboardStats {
    totalAppointments: number;
    completedAppointments: number;
    pendingAppointments: number;
    totalPatients: number;
    todayAppointments: AppointmentPreview[];
    todayAppointmentsCount: number;
    pendingToday: number;
    completedToday: number;
    totalEarnings: number;
    dashboardDate: Date;
}

export interface DoctorSchedule {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    slotDurationMinutes: number;
    slotCapacity: number;
    fullDay: boolean;
    consultationType: 'VIDEO' | 'CLINIC';
}

export interface ConsultedPatientRecord {
    id: string;
    firstName: string;
    lastName: string;
    patientId: string;
    lastConsultationDate: Date;
}

export interface PrescriptionRecord {
    id: string;
    patientName: string;
    date: Date;
    medicines: {
        name: string;
        dosage: string;
        frequency: string;
        duration: string;
    }[];
    instructions?: string;
}

export interface DoctorFilters extends PaginationQuery {
    specialty?: string;
    status?: string;
    availableToday?: boolean;
    minFee?: number;
    maxFee?: number;
    experienceYears?: number;
    minRating?: number;
    language?: string;
}

export interface PaginatedDoctors extends PaginatedResponse<Doctor> {}
