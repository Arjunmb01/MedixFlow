export interface DoctorProfile {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    specialty: string;
    licenseNumber: string;
    consultationFee: number;
    bio?: string;
    avatarUrl?: string;
    rating?: number;
    experience?: number;
    status?: string;
    user: {
        id: string;
        email: string;
        status: string;
    };
    schedules: DoctorSchedule[];
}

export interface DoctorSchedule {
    id?: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    fullDay: boolean;
    slotDurationMinutes: number;
    slotCapacity?: number;
}
