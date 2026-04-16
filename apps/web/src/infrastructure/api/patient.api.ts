import axiosInstance from "@/core/api/axios";


import type { PatientProfile, UpdatePatientProfilePayload, EmergencyContact, BookAppointmentPayload } from "@/domain/patient/types/patient.types";

export const getPatientProfile = async (): Promise<PatientProfile> => {
    const response = await axiosInstance.get("/patient/profile");
    const data = response.data;
    return {
        ...data,
        name: `${data.firstName || ''} ${data.lastName || ''}`.trim(),
        mobile: data.phone || ''
    };
};

export const updatePatientProfile = async (data: UpdatePatientProfilePayload) => {
    const nameParts = data.name ? data.name.trim().split(' ') : [];
    const payload: any = {
        phone: data.mobile,
        bloodGroup: data.bloodGroup,
        gender: data.gender
    };
    if (nameParts.length > 0) {
        payload.firstName = nameParts[0];
        payload.lastName = nameParts.slice(1).join(' ') || "";
    }
    const response = await axiosInstance.put("/patient/profile", payload);
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
    const response = await axiosInstance.get("/admin/stats");
    return response.data;
};

export const getAvailableSlots = async (doctorId: string, date: string) => {
    const response = await axiosInstance.get(`/doctor/${doctorId}/slots`, { params: { date } });
    return response.data
}

export const bookAppointment = async (data: BookAppointmentPayload) => {
    const response = await axiosInstance.post(`/apppointments`, data);
    return response.data
}

export const getDashboardStats = async () => {
    const response = await axiosInstance.get("/patient/dashboard-stats");
    return response.data;
};

export const getUpcomingAppointments = async () => {
    const response = await axiosInstance.get("/patient/appointments/upcoming");
    return response.data;
};

export const getPatientAppointments = async () => {
    const response = await axiosInstance.get("/patient/appointments");
    return response.data;
};

export const cancelAppointment = async (id: string, reason: string) => {
    const response = await axiosInstance.patch(`/patient/appointments/${id}/cancel`, { reason });
    return response.data;
};

export const rescheduleAppointment = async (
    id: string,
    newDate: string,
    slotStart: string,
    slotEnd: string
) => {
    const response = await axiosInstance.patch(`/patient/appointments/${id}/reschedule`, { newDate, slotStart, slotEnd });
    return response.data;
};
