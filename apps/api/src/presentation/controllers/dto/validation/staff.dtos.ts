import { z } from "zod";
import { UserStatus } from "@/domain/value-objects/enums/UserStatus";

const baseDoctorSchema = z.object({
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
      slotDurationMinutes: z.number().default(30),
      slotCapacity: z.number().default(1),
      fullDay: z.boolean().default(false),
      consultationType: z.enum(["VIDEO", "CLINIC"]).default("CLINIC")
  })).min(1)
});

export const createDoctorSchema = baseDoctorSchema.refine(data => (data.firstName.length + data.lastName.length) <= 20, {
  message: "Total length of first and last name cannot exceed 20 characters",
  path: ["firstName"]
});

export const updateDoctorSchema = baseDoctorSchema.partial();

export const getDoctorsQuerySchema = z.object({
  search: z.string().optional(),
  specialty: z.string().optional(),
  status: z.nativeEnum(UserStatus).optional(),
  page: z.string().transform(val => parseInt(val) || 1).optional(),
  limit: z.string().transform(val => parseInt(val) || 10).optional()
});

import { AppointmentStatus } from "@/domain/value-objects/enums/AppointmentStatus";

export const getDoctorAppointmentsQuerySchema = z.object({
  status: z.nativeEnum(AppointmentStatus).optional(),
  fromDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
  toDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
  type: z.enum(["upcoming", "past"]).optional(),
  page: z.string().transform(val => parseInt(val) || 1).optional(),
  limit: z.string().transform(val => parseInt(val) || 10).optional()
});

export const generateSlotsSchema = z.object({
  date: z.string().transform(val => new Date(val))
});

export const updatePrescriptionSchema = z.object({
  instructions: z.string().optional(),
  medicines: z.array(z.object({
    name: z.string().min(1, "Medicine name is required"),
    dosage: z.string().min(1, "Dosage is required"),
    frequency: z.string().min(1, "Frequency is required"),
    duration: z.string().min(1, "Duration is required")
  }))
});
