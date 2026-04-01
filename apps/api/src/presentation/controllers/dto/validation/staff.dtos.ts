import { z } from "zod";

export const createDoctorSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  phone: z.string(),
  specialty: z.string(),
  licenseNumber: z.string(),
  consultationFee: z.number().nonnegative(),
  schedules: z.array(z.object({
      dayOfWeek: z.number().min(0).max(6),
      startTime: z.string(),
      endTime: z.string(),
      slotDuration: z.number().default(30),
      consultationType: z.enum(["VIDEO", "CLINIC"]).default("CLINIC")
  })).min(1)
});

export const updateDoctorSchema = createDoctorSchema.partial();

export const getDoctorsQuerySchema = z.object({
  search: z.string().optional(),
  specialty: z.string().optional(),
  status: z.string().optional(),
  page: z.string().transform(val => parseInt(val) || 1).optional(),
  limit: z.string().transform(val => parseInt(val) || 10).optional()
});
