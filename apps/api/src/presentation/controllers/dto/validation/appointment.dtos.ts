import { z } from "zod";
import { PaymentMethod } from "../../../../domain/value-objects/enums/PaymentMethod";

export const getAvailableSlotsSchema = z.object({
  params: z.object({
    doctorId: z.string().uuid("Invalid doctor ID format")
  }),
  query: z.object({
    date: z.string().transform((val) => new Date(val))
  })
});

export const bookAppointmentSchema = z.object({
  patientId: z.string().uuid("Invalid patient ID format"),
  doctorId: z.string().uuid("Invalid doctor ID format"),
  date: z.string().transform((val) => new Date(val)),
  slotStart: z.string(),
  slotEnd: z.string(),
  paymentMethod: z.nativeEnum(PaymentMethod).optional()
});
