import { z } from "zod"

export const createDoctorSchema = z.object({
    email: z.string().email(),
    firstName: z.string().regex(/^[a-zA-Z\s]+$/, "First name should only contain letters").min(1, "First name is required"),
    lastName: z.string().regex(/^[a-zA-Z\s]+$/, "Last name should only contain letters").min(1, "Last name is required"),
    phone: z.string().regex(/^\d+$/, "Phone must only contain numbers").min(10, "Phone number must be at least 10 digits"),
    specialty: z.string().min(1, "Specialty is required"),
    consultationFee: z.number().min(0),
    licenseNumber: z.string().min(1, "License number is required"),
    schedules: z.array(z.object({
        dayOfWeek: z.number().min(0).max(6),
        startTime: z.string(),
        endTime: z.string(),
        fullDay: z.boolean().default(false),
        slotDurationMinutes: z.number().default(30)
    })).min(1, "At least one schedule is required")
})

export type CreateDoctorDto = z.infer<typeof createDoctorSchema>

export const getDoctorsQuerySchema = z.object({
    search: z.string().optional(),
    specialty: z.string().optional(),
    status: z.preprocess((val) => (val === "" ? undefined : val), z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]).optional()),
    page: z.preprocess((val) => (val === "" ? undefined : val), z.coerce.number().min(1).default(1)),
    limit: z.preprocess((val) => (val === "" ? undefined : val), z.coerce.number().min(1).default(10))
})
