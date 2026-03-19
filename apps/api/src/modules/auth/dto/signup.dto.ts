import { z } from "zod";
import { MESSAGES } from "../../../core/constants";

export const signupSchema = z.object({

  firstName: z.string()
    .min(1, "First name is required")
    .regex(/^[A-Za-z]+$/, "First name must contain only letters"),

  lastName: z.string()
    .min(1, "Last name is required")
    .regex(/^[A-Za-z]+$/, "Last name must contain only letters"),

  email: z.string()
    .email("Invalid email address"),

  phone: z.string()
    .regex(/^[0-9]{10}$/, "Phone must be exactly 10 digits"),

  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&]).+$/,
      "Password must contain letters, numbers and symbols"
    ),

 acceptedTerms: z.literal(true, {
  message: MESSAGES.TERMS_ACCEPTED_REQUIRED
}),

});

export type SignupDTO = z.infer<typeof signupSchema>;