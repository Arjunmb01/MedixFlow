export interface IDoctorRepository {
    findById(userId: string): Promise<any>;
    getProfile(userId: string): Promise<any>;
    updateProfile(userId: string, data: any): Promise<any>;
    updatePassword(userId: string, passwordHash: string): Promise<any>;
    getDashboardStats(userId: string): Promise<any>;
    updateSchedules(userId: string, schedules: any[]): Promise<any>;
    getDoctorsFiltered(filters: any): Promise<any>;
    findProfileById(doctorId: string): Promise<any>;
}
