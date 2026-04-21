import axiosInstance from "@/core/api/axios";

export const checkIn = async (appointmentId: string) => {
    const response = await axiosInstance.post(`/patient/appointments/${appointmentId}/checkin`);
    return response.data;
};

export const getDoctorQueue = async (date?: Date) => {
    const params = date ? { date: date.toISOString().split("T")[0] } : {};
    const response = await axiosInstance.get(`/doctor/consultations/queue`, { params });
    return response.data;
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
            dosage: string;
            frequency: string;
            duration: string;
            instructions?: string;
        }[];
    };
}

export const completeConsultation = async (consultationId: string, payload: CompleteConsultationPayload) => {
    const response = await axiosInstance.patch(`/doctor/consultations/${consultationId}/complete`, payload);
    return response.data;
};

export const getConsultationDetails = async (consultationId: string) => {
    const response = await axiosInstance.get(`/doctor/consultations/${consultationId}`);
    return response.data;
};

export const getPatientHistory = async (patientId: string) => {
    const response = await axiosInstance.get(`/doctor/consultations/patient-history`, {
        params: { patientId },
    });
    return response.data;
};

// Lab Test Endpoints
export const requestLabTests = async (consultationId: string, tests: { testName: string }[]) => {
    const response = await axiosInstance.post(`/doctor/consultations/${consultationId}/lab-tests`, { tests });
    return response.data;
};

export const getLabTests = async (consultationId: string, role: "doctor" | "patient" = "doctor") => {
    const response = await axiosInstance.get(`/${role}/consultations/${consultationId}/lab-tests`);
    return response.data;
};

export const uploadLabTest = async (consultationId: string, labTestId: string, reportUrl: string) => {
    const response = await axiosInstance.post(`/patient/consultations/${consultationId}/lab-tests/${labTestId}/upload`, { reportUrl });
    return response.data;
};
