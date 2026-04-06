export interface Appointment {
    id: string;
    appointmentDate: string | Date;
    slotStart: string;
    slotEnd: string;
    status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
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
    consultation?: any;
}