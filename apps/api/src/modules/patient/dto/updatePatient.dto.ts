import { z } from "zod"

export const updatePatientSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters"),

  mobile: z
    .string()
    .regex(/^[0-9]{10}$/, "Invalid mobile number"),

  bloodGroup: z
    .enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"])
    .optional()
})

export type UpdatePatientDTO = z.infer<typeof updatePatientSchema>