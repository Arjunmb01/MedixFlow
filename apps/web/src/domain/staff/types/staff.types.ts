
export interface CreateDoctorPayload {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    specialty: string;
    licenseNumber: string;
    consultationFee: number;
    schedules?: any[];
}

export interface StaffDashboardStats {
    totalDoctors: number;
    activeDoctors: number;
    pendingDoctors: number;
    totalSpecialties: number;
}
