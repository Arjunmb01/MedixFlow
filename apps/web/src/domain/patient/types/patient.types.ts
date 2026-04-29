export interface EmergencyContact {
    name: string;
    mobile: string;
}

export interface PatientProfile {
    id: string;
    patientId: string;
    name: string;
    email: string;
    mobile: string;
    bloodGroup?: string;
    gender?: string;
    emergencyContacts: EmergencyContact[];
    profileCompletion: number;
    wallet?: {
        balance: number;
    };
}

export interface UpdatePatientProfilePayload {
    name?: string;
    mobile?: string;
    bloodGroup?: string;
    gender?: string;
}

export interface BookAppointmentPayload {
    patientId : string;
    doctorId : string;
    date : string;
    slotStart : string;
    slotEnd : string;
}
