import axios from "@/core/api/axios"

export const getPatientsList = async (params: { 
    search?: string,
    status?: string,
    gender?: string,
    page?: number, 
    limit?: number 
}) => {
    const { data } = await axios.get("/admin/patients", { params })
    return data
}

export const getPatientDetails = async (id: string) => {
    const { data } = await axios.get(`/admin/patients/${id}`)
    return data
}

export const updatePatientStatus = async (id: string, status: string) => {
    const { data } = await axios.patch(`/admin/patients/${id}/status`, { status })
    return data
}

export const deletePatient = async (id: string) => {
    const { data } = await axios.delete(`/admin/patients/${id}`)
    return data
}

export const getAdminStats = async () => {
    const { data } = await axios.get("/admin/stats")
    return data
}
