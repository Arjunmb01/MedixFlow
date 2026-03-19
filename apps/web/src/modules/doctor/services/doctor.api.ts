import api from "@/core/api/axios"

export const getDoctorProfile = async () => {
    const { data } = await api.get("/doctor/profile")
    return data
}

export const updateDoctorProfile = async (payload: any) => {
    const { data } = await api.put("/doctor/profile", payload)
    return data
}

export const updateDoctorPassword = async (payload: any) => {
    const { data } = await api.put("/doctor/password", payload)
    return data
}

export const updateDoctorSchedules = async (payload: any) => {
    const { data } = await api.put("/doctor/schedules", payload)
    return data
}

export const getDoctorDashboardStats = async () => {
    const { data } = await api.get("/doctor/dashboard/stats")
    return data
}

export const uploadImage = async (file: File) => {
    const formData = new FormData()
    formData.append("image", file)
    const { data } = await api.post("/common/upload/image", formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    })
    return data
}
