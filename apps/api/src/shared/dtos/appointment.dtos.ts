import { z } from "zod";
import { PaymentMethod } from "@/domain/value-objects/enums/PaymentMethod";
import { AppointmentStatus } from "@/domain/value-objects/enums/AppointmentStatus";

export const getAvailableSlotsSchema = z.object({
    params: z.object({
        doctorId: z.string().uuid(),
    }),
    query: z.object({
        date: z.string().transform((val) => new Date(val)),
    }),
});

export const bookAppointmentSchema = z.object({
    patientId: z.string().uuid(),
    doctorId: z.string().uuid(),
    date: z.string().transform((val) => new Date(val)),
    slotStart: z.string().regex(/^([01]\d|2[0-3]):?([0-5]\d)$/, "Invalid time format (HH:mm)"),
    slotEnd: z.string().regex(/^([01]\d|2[0-3]):?([0-5]\d)$/, "Invalid time format (HH:mm)"),
    paymentMethod: z.nativeEnum(PaymentMethod).default(PaymentMethod.RAZORPAY),
    useWallet: z.boolean().optional().default(false),
    consultationType: z.enum(["VIDEO", "CLINIC"]).optional(),
});

export const updateAppointmentStatusSchema = z.object({
    params: z.object({
        id: z.string().uuid(),
    }),
    body: z.object({
        status: z.nativeEnum(AppointmentStatus),
    }),
});

export type GetAvailableSlotsDTO = z.infer<typeof getAvailableSlotsSchema>;
export type BookAppointmentDTO = z.infer<typeof bookAppointmentSchema>;
export type UpdateAppointmentStatusDTO = z.infer<typeof updateAppointmentStatusSchema>;
