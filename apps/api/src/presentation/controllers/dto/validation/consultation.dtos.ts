import { z } from "zod";

export const consultationIdSchema = z.object({
  id: z.string().uuid("Invalid consultation ID format")
});

export const appointmentIdParamSchema = z.object({
  appointmentId: z.string().uuid("Invalid appointment ID format")
});

export const getQueueQuerySchema = z.object({
  date: z.string().optional().transform(val => val ? new Date(val) : new Date())
});

export const completeConsultationSchema = z.object({
  vitals: z.object({
    temperature: z.coerce.number().optional(),
    bloodPressure: z.string().optional(),
    heartRate: z.coerce.number().optional(),
    weight: z.coerce.number().optional()
  }).optional(),
  medicalRecord: z.object({
    symptoms: z.string().min(1, "Symptoms are required"),
    diagnosis: z.string().min(1, "Diagnosis is required"),
    notes: z.string().optional()
  }),
  prescription: z.object({
    instructions: z.string().optional(),
    medicines: z.array(z.object({
      name: z.string().min(1, "Medicine name is required"),
      dosage: z.string().min(1, "Dosage is required"),
      frequency: z.string().min(1, "Frequency is required"),
      duration: z.string().min(1, "Duration is required")
    }))
  }).optional()
});

export const getHistoryQuerySchema = z.object({
  patientId: z.string().uuid("Invalid patient ID format")
});
