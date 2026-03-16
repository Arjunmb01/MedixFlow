import { z } from "zod"

export const emergencyContactSchema = z.object({

  contacts: z.array(
    z.object({
      name: z.string().min(2),
      mobile: z.string().regex(/^[0-9]{10}$/)
    })
  ).max(2)

})

export type EmergencyContactDTO = z.infer<typeof emergencyContactSchema>