import axiosInstance from "@/core/api/axios";
import type { DoctorProfile, DoctorSchedule } from "@/domain/doctor/types/doctor.types";

export const getDoctorProfile = async (): Promise<DoctorProfile> => {
    const response = await axiosInstance.get("/doctor/profile");
    return response.data;
};

export const updateDoctorProfile = async (data: Partial<DoctorProfile>) => {
    const response = await axiosInstance.put("/doctor/profile", data);
    return response.data;
};

export const updateDoctorPassword = async (data: any) => {
    const response = await axiosInstance.put("/doctor/update-password", data);
    return response.data;
};

export const getDoctorDashboardStats = async () => {
    const response = await axiosInstance.get("/doctor/dashboard-stats");
    return response.data;
};

export const getDoctorAppointments = async () => {
    const response = await axiosInstance.get("/doctor/appointments");
    return response.data;
};

export const getDoctorNotifications = async () => {
    const response = await axiosInstance.get("/doctor/notifications");
    return response.data;
};

export const updateDoctorSchedules = async (schedules: Partial<DoctorSchedule>[]) => {
    const response = await axiosInstance.put("/doctor/schedules", schedules);
    return response.data;
};

// Public Doctor API for Patients
export const getDoctorsFiltered = async (filters: any) => {
    const response = await axiosInstance.get("/doctors", { params: filters });
    return response.data;
};

export const getDoctorProfileById = async (id: string): Promise<DoctorProfile> => {
    const response = await axiosInstance.get(`/doctors/${id}`);
    return response.data;
};

export const uploadImage = async (file: File) => {
    const formData = new FormData()
    formData.append("image", file)
    const { data } = await axiosInstance.post("/common/upload/image", formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    })
    return data
};

export const getDoctorConsultedPatients = async () => {
    const response = await axiosInstance.get("/doctor/patients");
    return response.data;
};

export const getDoctorPrescriptionsList = async () => {
    const response = await axiosInstance.get("/doctor/prescriptions");
    return response.data;
};

export const updateDoctorPrescription = async (prescriptionId: string, data: any) => {
    const response = await axiosInstance.patch(`/doctor/prescriptions/${prescriptionId}`, data);
    return response.data;
};
