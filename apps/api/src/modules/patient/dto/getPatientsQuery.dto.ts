import { z } from "zod"

export const getPatientsQuerySchema = z.object({
    search: z.string().optional(),
    status: z.preprocess((val) => (val === "" ? undefined : val), z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]).optional()),
    gender: z.preprocess((val) => (val === "" ? undefined : val), z.enum(["MALE", "FEMALE", "OTHER"]).optional()),
    page: z.preprocess((val) => (val === "" ? undefined : val), z.coerce.number().min(1).default(1)),
    limit: z.preprocess((val) => (val === "" ? undefined : val), z.coerce.number().min(1).default(10))
})

export type GetPatientsQueryDto = z.infer<typeof getPatientsQuerySchema>
