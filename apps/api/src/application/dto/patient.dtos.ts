export interface UpdatePatientProfileUseCaseInput {
    id: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    bloodGroup?: string;
    emergencyContact?: {
        name: string;
        phone: string;
        relation: string;
    };
}

export interface PatientProfileDTO {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    bloodGroup?: string;
    completionPercentage: number;
    isProfileComplete: boolean;
}
