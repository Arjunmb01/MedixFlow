export type UserStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED"

export interface StaffMember {
    id: string
    firstName: string
    lastName: string
    phone: string | null
    specialty: string
    licenseNumber: string
    consultationFee: number
    rating: number
    user: {
        id: string
        email: string
        status: UserStatus
        createdAt: string
    }
    schedules: {
        id: string
        dayOfWeek: number
        startTime: string
        endTime: string
        fullDay: boolean
        slotDurationMinutes: number
    }[]
}

export interface StaffListResponse {
    data: StaffMember[]
    meta: {
        total: number
        page: number
        limit: number
        totalPages: number
    }
}

export interface CreateStaffPayload {
    firstName: string
    lastName: string
    email: string
    phone: string
    specialty: string
    consultationFee: number
    licenseNumber: string
    schedules: {
        dayOfWeek: number
        startTime: string
        endTime: string
        fullDay: boolean
        slotDurationMinutes: number
    }[]
}
