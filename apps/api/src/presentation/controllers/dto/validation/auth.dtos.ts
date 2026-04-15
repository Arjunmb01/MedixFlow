import { z } from "zod";
import { MESSAGES } from "@/shared/constants";

export const signupSchema = z.object({
  firstName: z.string()
    .min(1, "First name is required").max(15, "First name cannot exceed 15 characters")
    .regex(/^[A-Za-z]+$/, "First name must contain only letters"),

  lastName: z.string()
    .min(1, "Last name is required").max(15, "Last name cannot exceed 15 characters")
    .regex(/^[A-Za-z]+$/, "Last name must contain only letters"),

  email: z.string()
    .email("Invalid email address").max(30, "Email cannot exceed 30 characters"),

  phone: z.string()
    .regex(/^[0-9]{10}$/, "Phone must be exactly 10 digits").max(15, "Phone cannot exceed 15 characters"),

  password: z.string()
    .min(8, "Password must be at least 8 characters").max(35, "Password cannot exceed 35 characters")
    .regex(
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&]).+$/,
      "Password must contain letters, numbers and symbols"
    ),

  acceptedTerms: z.literal(true, {
    message: MESSAGES.TERMS_ACCEPTED_REQUIRED
  }),
});

export const verifyOtpSchema = z.object({
  email: z.string().email("Invalid email address"),
  otp: z.string().length(6, "OTP must be 6 digits"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&]).+$/,
      "Password must contain letters, numbers and symbols"
    ),
});

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&]).+$/,
      "Password must contain letters, numbers and symbols"
    ),
});
