export interface CheckinPatientUseCaseInput {
    doctorId: string;
    patientId: string;
}

export interface CompleteConsultationUseCaseInput {
    id: string;
    doctorId: string;
    vitals?: {
        bloodPressure?: string;
        heartRate?: number;
        temperature?: number;
        weight?: number;
    };
    medicalRecord?: {
        symptoms: string;
        diagnosis: string;
        notes?: string;
    };
    prescription?: {
        instructions?: string;
        medicines: {
            name: string;
            dosage: string;
            frequency: string;
            duration: string;
        }[];
    };
}

export interface StartConsultationUseCaseInput {
    id: string;
    doctorId: string;
}

export interface GetDoctorQueueUseCaseInput {
    doctorId: string;
    date: Date;
}
