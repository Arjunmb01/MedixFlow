import axiosInstance from "@/core/api/axios";
import type { CreateDoctorPayload } from "@/domain/staff/types/staff.types";
import type { DoctorProfile } from "@/domain/doctor/types/doctor.types";

export const getDoctors = async (params?: any) => {
    const response = await axiosInstance.get("/staff/doctors", { params });
    return response.data;
};

export const createDoctor = async (data: CreateDoctorPayload) => {
    const response = await axiosInstance.post("/staff/doctors", data);
    return response.data;
};

export const updateStaffDoctor = async (id: string, data: Partial<DoctorProfile>) => {
    const response = await axiosInstance.put(`/staff/doctors/${id}`, data);
    return response.data;
};

export const blockDoctor = async (id: string, status: string) => {
    const response = await axiosInstance.put(`/staff/doctors/${id}/block`, { status });
    return response.data;
};

export const deleteDoctor = async (id: string) => {
    const response = await axiosInstance.delete(`/staff/doctors/${id}`);
    return response.data;
};

export const setupDoctorPassword = async (data: any) => {
    const response = await axiosInstance.post("/staff/setup-password", data);
    return response.data;
};
