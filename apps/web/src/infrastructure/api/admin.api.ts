import axiosInstance from "@/core/api/axios";

export const getAdminAppointments = async () => {
    const response = await axiosInstance.get("/admin/appointments");
    return response.data;
};
