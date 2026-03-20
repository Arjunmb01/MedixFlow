import axiosInstance from "@/core/api/axios";
import type { PatientProfile, UpdatePatientProfilePayload, EmergencyContact } from "@/domain/patient/types/patient.types";

export const getPatientProfile = async (): Promise<PatientProfile> => {
    const response = await axiosInstance.get("/patient/profile");
    return response.data;
};

export const updatePatientProfile = async (data: UpdatePatientProfilePayload) => {
    const response = await axiosInstance.put("/patient/profile", data);
    return response.data;
};

export const updateEmergencyContacts = async (contacts: EmergencyContact[]) => {
    const response = await axiosInstance.put("/patient/emergency-contacts", { contacts });
    return response.data;
};

export const updatePassword = async (data: any) => {
    const response = await axiosInstance.put("/patient/update-password", data);
    return response.data;
};

export const getAllPatients = async (params: any) => {
    const response = await axiosInstance.get("/admin/patients", { params });
    return response.data;
};

export const getPatientById = async (id: string) => {
    const response = await axiosInstance.get(`/admin/patients/${id}`);
    return response.data;
};

export const updatePatientStatus = async (id: string, status: string) => {
    const response = await axiosInstance.put(`/admin/patients/${id}/status`, { status });
    return response.data;
};

export const deletePatient = async (id: string) => {
    const response = await axiosInstance.delete(`/admin/patients/${id}`);
    return response.data;
};

export const getAdminStats = async () => {
    const response = await axiosInstance.get("/admin/patients/stats");
    return response.data;
};
