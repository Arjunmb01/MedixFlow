import axiosInstance from "@/core/api/axios";

export const getAdminAppointments = async () => {
    const response = await axiosInstance.get("/admin/appointments");
    return response.data;
};

export const rescheduleAppointment = async (
    id: string,
    newDate: string,
    slotStart: string,
    slotEnd: string
) => {
    const response = await axiosInstance.patch(`/admin/appointments/${id}/reschedule`, { newDate, slotStart, slotEnd });
    return response.data;
};
