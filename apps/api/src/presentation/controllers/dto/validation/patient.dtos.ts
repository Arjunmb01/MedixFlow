import { z } from "zod";
import { UserStatus } from "@/domain/value-objects/enums/UserStatus";
import { Gender } from "@/domain/value-objects/enums/Gender";

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

export const blockPatientSchema = z.object({
  id: z.string().uuid("Invalid patient ID format"),
  status: z.nativeEnum(UserStatus)
});

export const updatePatientProfileSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters").optional(),
  lastName: z.string().min(2, "Last name must be at least 2 characters").optional(),
  phone: z.string().regex(/^\d{10}$/, "Phone must be exactly 10 digits").optional(),
  gender: z.nativeEnum(Gender).optional(),
  bloodGroup: z.string().optional(),
  dob: z.string().transform(val => new Date(val)).optional(),
  avatarUrl: z.string().url("Invalid avatar URL").optional().or(z.literal(""))
});
