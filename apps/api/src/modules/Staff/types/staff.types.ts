import { Role, UserStatus } from "@prisma/client"

export interface CreateDoctorPayload {
    email: string
    firstName: string
    lastName: string
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

export interface GetDoctorsQuery {
    search?: string
    specialty?: string
    status?: UserStatus
    page?: number
    limit?: number
}
