import { z } from "zod"

export const updatePatientSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters"),

  mobile: z
    .string()
    .min(7, "Mobile number is too short")
    .max(15, "Mobile number is too long")
    .regex(/^[+\d\s\-()]+$/, "Invalid mobile number format"),

  bloodGroup: z
    .preprocess(
      (val) => (val === "" ? undefined : val),
      z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]).optional()
    ),

  gender: z
    .preprocess(
      (val) => (val === "" ? undefined : val),
      z.enum(["MALE", "FEMALE", "OTHER"]).optional()
    )
})

export type UpdatePatientDTO = z.infer<typeof updatePatientSchema>