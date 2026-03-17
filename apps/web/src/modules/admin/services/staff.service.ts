import axios from "@/core/api/axios"
import type { StaffListResponse, CreateStaffPayload } from "../types/staff.types"

export const getStaffList = async (params: { 
    search?: string, 
    specialty?: string, 
    status?: string, 
    page?: number, 
    limit?: number 
}): Promise<StaffListResponse> => {
    const { data } = await axios.get("/staff", { params })
    return data
}

export const createStaffMember = async (payload: CreateStaffPayload) => {
    const { data } = await axios.post("/staff", payload)
    return data
}

export const toggleStaffStatus = async (id: string, status: string) => {
    const { data } = await axios.patch(`/staff/${id}/status`, { status })
    return data
}

export const updateStaffMember = async (id: string, payload: Partial<CreateStaffPayload>) => {
    const { data } = await axios.patch(`/staff/${id}`, payload)
    return data
}

export const deleteStaffMember = async (id: string) => {
    const { data } = await axios.delete(`/staff/${id}`)
    return data
}

export const setupPassword = async (payload: { token: string, password: string }) => {
    const { data } = await axios.post("/staff/setup-password", payload)
    return data
}
