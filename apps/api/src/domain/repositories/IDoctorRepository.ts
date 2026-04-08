import { 
    DoctorProfile, 
    DoctorDashboardStats, 
    DoctorSchedule, 
    ConsultedPatientRecord, 
    PrescriptionRecord, 
    DoctorFilters, 
    PaginatedDoctors 
} from "../value-objects/types/doctor.repository.types";
import { Doctor } from "../entities/Doctor";

export interface IDoctorProfileRepository {
    findById(userId: string): Promise<Doctor | null>;
    getProfile(userId: string): Promise<DoctorProfile | null>;
    findProfileById(doctorId: string): Promise<DoctorProfile | null>;
    updateProfile(userId: string, data: Partial<DoctorProfile>): Promise<DoctorProfile>;
    updatePassword(userId: string, passwordHash: string): Promise<void>;
    updateSchedules(userId: string, schedules: DoctorSchedule[]): Promise<void>;
    getSchedulesByDay(doctorId: string, dayOfWeek: number): Promise<DoctorSchedule[]>;
}

export interface IDoctorStatsRepository {
    getDashboardStats(userId: string, date?: Date): Promise<DoctorDashboardStats>;
    getDoctorsFiltered(filters: DoctorFilters & { page: number; limit: number }): Promise<PaginatedDoctors>;
    getRawStats(userId: string, date: Date): Promise<{
        totalAppointments: number;
        completedAppointments: number;
        pendingAppointments: number;
        uniquePatientsCount: number;
        todayAppointments: any[];
        totalEarnings: number;
    }>;
}

export interface IDoctorMedicalRepository {
    getConsultedPatients(doctorId: string): Promise<ConsultedPatientRecord[]>;
    getDoctorPrescriptions(doctorId: string): Promise<PrescriptionRecord[]>;
    updatePrescription(prescriptionId: string, data: Partial<PrescriptionRecord>): Promise<PrescriptionRecord>;
}

