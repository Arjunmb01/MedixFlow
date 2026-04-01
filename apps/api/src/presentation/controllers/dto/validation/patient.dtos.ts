import { z } from "zod";
import { UserStatus, Gender } from "@prisma/client";

export const getPatientsQuerySchema = z.object({
  search: z.string().optional(),
  status: z.nativeEnum(UserStatus).optional(),
  gender: z.nativeEnum(Gender).optional(),
  page: z.string().transform(val => parseInt(val) || 1),
  limit: z.string().transform(val => parseInt(val) || 10)
});

export const emergencyContactSchema = z.object({
  contacts: z.array(z.object({
    name: z.string()
      .min(2, "Name must be at least 2 characters")
      .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"),
    mobile: z.string()
      .regex(/^\d{10}$/, "Mobile must be a valid 10-digit number")
  })).min(1, "At least one emergency contact is required")
});
