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
}

export interface UpdatePatientProfilePayload {
    name?: string;
    mobile?: string;
    bloodGroup?: string;
    gender?: string;
}
