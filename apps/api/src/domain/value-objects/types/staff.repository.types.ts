import { UserStatus } from "../enums/UserStatus";
import { DoctorProfile, DoctorSchedule as DomainDoctorSchedule } from "./doctor.repository.types";

export interface StaffDoctorListItem {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    specialty: string;
    email: string;
    status: UserStatus;
    user: {
        id: string;
        email: string;
        status: UserStatus;
    };
    createdAt: Date;
    licenseNumber?: string;
    consultationFee?: number;
    schedules?: DomainDoctorSchedule[];
}

export interface PaginatedStaffDoctors {
    doctors: StaffDoctorListItem[];
    stats: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export interface CreateDoctorInput {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    specialty: string;
    consultationFee: number;
    licenseNumber: string;
    bio?: string;
    avatarUrl?: string;
    experienceYears?: number;
    languages?: string[];
    schedules: {
        dayOfWeek: number;
        startTime: string;
        endTime: string;
        slotDurationMinutes: number;
        slotCapacity: number;
        fullDay: boolean;
        consultationType: 'VIDEO' | 'CLINIC';
    }[];
}

export interface UpdateDoctorInput extends Partial<CreateDoctorInput> {
    email?: string;
}

export interface StaffDoctorFilters {
    search?: string;
    specialty?: string;
    status?: UserStatus;
}
