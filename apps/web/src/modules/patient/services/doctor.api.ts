import api from "@/core/api/axios"

export const getAllDoctors = async (params?: { 
    specialty?: string; 
    search?: string;
    availableToday?: boolean;
    minFee?: number;
    maxFee?: number;
    page?: number;
    limit?: number;
}) => {
    const { data } = await api.get("/doctors", { params })
    return data as { doctors: any[], total: number }
}

export const getDoctorDetails = async (id: string) => {
    const { data } = await api.get(`/doctors/${id}`)
    return data
}
