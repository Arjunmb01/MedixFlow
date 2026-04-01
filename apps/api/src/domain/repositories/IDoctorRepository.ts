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

export interface IDoctorRepository {
    findById(userId: string): Promise<Doctor | null>;
    getProfile(userId: string): Promise<DoctorProfile | null>;
    updateProfile(userId: string, data: Partial<DoctorProfile>): Promise<DoctorProfile>;
    updatePassword(userId: string, passwordHash: string): Promise<void>;
    getDashboardStats(userId: string): Promise<DoctorDashboardStats>;
    updateSchedules(userId: string, schedules: DoctorSchedule[]): Promise<void>;
    getDoctorsFiltered(filters: DoctorFilters & { page: number; limit: number }): Promise<PaginatedDoctors>;
    findProfileById(doctorId: string): Promise<DoctorProfile | null>;
    getSchedulesByDay(doctorId: string, dayOfWeek: number): Promise<DoctorSchedule[]>;
    getConsultedPatients(doctorId: string): Promise<ConsultedPatientRecord[]>;
    getDoctorPrescriptions(doctorId: string): Promise<PrescriptionRecord[]>;
    updatePrescription(prescriptionId: string, data: Partial<PrescriptionRecord>): Promise<PrescriptionRecord>;
}
