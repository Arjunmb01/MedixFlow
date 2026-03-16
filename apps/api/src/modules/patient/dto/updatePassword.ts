import { z } from "zod"

export const updatePasswordSchema = z.object({

  currentPassword: z.string().min(6),

  newPassword: z
    .string()
    .min(8, "Password must be 8 characters")
    .regex(/[A-Z]/, "Must contain uppercase")
    .regex(/[0-9]/, "Must contain number")

})

export type UpdatePasswordDTO = z.infer<typeof updatePasswordSchema>