export interface Appointment {
    id: string;
    appointmentDate: string | Date;
    slotStart: string;
    slotEnd: string;
    status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NOT_ATTENDED";
    patient: {
        id: string;
        patientId: string;
        firstName: string;
        lastName: string;
        phone: string;
    };
    doctor: {
        id: string;
        firstName: string;
        lastName: string;
        specialization: {
            name: string;
        } | null;
    };
    reason?: string;
    consultation?: {
        id: string;
        status: string;
        prescription?: {
            id: string;
            instructions?: string | null;
            medicines: Array<{
                id: string;
                name: string;
                dosage: string;
                frequency: string;
                duration: string;
            }>;
        } | null;
    } | null;
}