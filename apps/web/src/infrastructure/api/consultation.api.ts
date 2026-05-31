import axiosInstance from "@/core/api/axios";

export const checkIn = async (appointmentId: string) => {
    const response = await axiosInstance.post(`/patient/appointments/${appointmentId}/checkin`);
    return response.data;
};

export const getDoctorQueue = async (date?: Date) => {
    const params = date ? { date: date.toISOString().split("T")[0] } : {};
    const response = await axiosInstance.get(`/doctor/consultations/queue`, { params });
    return response.data.data;
};

export const startConsultation = async (consultationId: string) => {
    const response = await axiosInstance.patch(`/doctor/consultations/${consultationId}/start`);
    return response.data;
};

export interface CompleteConsultationPayload {
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
        planForManagement?: string;
    };
    prescription?: {
        instructions?: string;
        medicines: {
            name: string;
            genericName?: string;
            dosage: string;
            frequency: string;
            morning: boolean;
            afternoon: boolean;
            night: boolean;
            duration: string;
            foodTiming: 'BEFORE_FOOD' | 'AFTER_FOOD' | 'WITH_FOOD' | 'EMPTY_STOMACH';
            instructions?: string;
            type: 'BRAND' | 'GENERIC';
        }[];
    };
}

export const completeConsultation = async (consultationId: string, payload: CompleteConsultationPayload) => {
    const response = await axiosInstance.patch(`/doctor/consultations/${consultationId}/complete`, payload);
    return response.data;
};

export const getConsultationDetails = async (consultationId: string) => {
    const response = await axiosInstance.get(`/doctor/consultations/${consultationId}`);
    return response.data.data;
};

export const getPatientHistory = async (patientId: string) => {
    const response = await axiosInstance.get(`/doctor/consultations/patient-history`, {
        params: { patientId },
    });
    return response.data.data;
};

// Lab Test Endpoints
export const requestLabTests = async (consultationId: string, tests: { testName: string; urgency?: string; testType?: string; instructions?: string; fastingRequired?: boolean }[]) => {
    const response = await axiosInstance.post(`/doctor/consultations/${consultationId}/lab-tests`, { tests });
    return response.data;
};

export const getLabTests = async (consultationId: string, role: "doctor" | "patient" = "doctor") => {
    const response = await axiosInstance.get(`/${role}/consultations/${consultationId}/lab-tests`);
    return response.data.data;
};

export const uploadLabTest = async (consultationId: string, labTestId: string, reportUrl: string) => {
    const response = await axiosInstance.post(`/patient/consultations/${consultationId}/lab-tests/${labTestId}/upload`, { reportUrl });
    return response.data;
};

export const reviewLabTest = async (consultationId: string, labTestId: string, reviewerComments: string, isAbnormal: boolean) => {
    const response = await axiosInstance.patch(`/doctor/consultations/${consultationId}/lab-tests/${labTestId}/review`, { reviewerComments, isAbnormal });
    return response.data;
};

// Draft & Workspace Management
export const saveConsultationDraft = async (consultationId: string, draft: any) => {
    const response = await axiosInstance.post(`/doctor/consultations/${consultationId}/draft`, draft);
    return response.data;
};

export const getConsultationDraft = async (consultationId: string) => {
    const response = await axiosInstance.get(`/doctor/consultations/${consultationId}/draft`);
    return response.data;
};

export const createFollowUpConsultation = async (consultationId: string, payload: { date: string; slotStart: string; slotEnd: string; reason?: string }) => {
    const response = await axiosInstance.post(`/doctor/consultations/${consultationId}/follow-up`, payload);
    return response.data;
};

export const scheduleFollowUp = async (payload: { 
    consultationId: string; 
    patientId: string; 
    doctorId: string; 
    scheduledDate: string; 
    time: string; 
    type: 'PHYSICAL' | 'VIDEO' | 'PHONE'; 
    reason?: string;
    notes?: string;
}) => {
    const response = await axiosInstance.post(`/doctor/consultations/follow-ups/schedule`, payload);
    return response.data;
};

export const generateConsultationPDF = async (consultationId: string, role: "doctor" | "patient" = "doctor") => {
    const response = await axiosInstance.get(`/${role}/consultations/${consultationId}/pdf`);
    return response.data;
};
