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
    notes: z.string().optional(),
    planForManagement: z.string().optional()
  }),
  prescription: z.object({
    instructions: z.string().optional(),
    medicines: z.array(z.object({
      name: z.string().min(1, "Medicine name is required"),
      genericName: z.string().optional(),
      dosage: z.string().min(1, "Dosage is required"),
      frequency: z.string().min(1, "Frequency is required"),
      morning: z.boolean().default(false),
      afternoon: z.boolean().default(false),
      night: z.boolean().default(false),
      duration: z.string().min(1, "Duration is required"),
      foodTiming: z.enum(['BEFORE_FOOD', 'AFTER_FOOD', 'WITH_FOOD', 'EMPTY_STOMACH']).default('AFTER_FOOD'),
      instructions: z.string().optional(),
      type: z.enum(['BRAND', 'GENERIC']).default('BRAND')
    }))
  }).optional()
});

export const getHistoryQuerySchema = z.object({
  patientId: z.string().uuid("Invalid patient ID format")
});

export const saveConsultationDraftSchema = z.object({
  vitals: z.object({
    temperature: z.coerce.number().optional(),
    bloodPressure: z.string().optional(),
    heartRate: z.coerce.number().optional(),
    weight: z.coerce.number().optional()
  }).optional(),
  medicalRecord: z.object({
    symptoms: z.string().optional(),
    diagnosis: z.string().optional(),
    notes: z.string().optional(),
    planForManagement: z.string().optional()
  }).optional(),
  prescription: z.object({
    instructions: z.string().optional(),
    medicines: z.array(z.object({
      name: z.string().optional(),
      genericName: z.string().optional(),
      dosage: z.string().optional(),
      frequency: z.string().optional(),
      morning: z.boolean().optional(),
      afternoon: z.boolean().optional(),
      night: z.boolean().optional(),
      duration: z.string().optional(),
      foodTiming: z.enum(['BEFORE_FOOD', 'AFTER_FOOD', 'WITH_FOOD', 'EMPTY_STOMACH']).optional(),
      instructions: z.string().optional(),
      type: z.enum(['BRAND', 'GENERIC']).optional()
    })).optional()
  }).optional()
});

export const createFollowUpSchema = z.object({
  date: z.string().transform(val => new Date(val)),
  slotStart: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:mm)"),
  slotEnd: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:mm)"),
  reason: z.string().optional()
});

export const scheduleFollowUpSchema = z.object({
  consultationId: z.string().uuid(),
  patientId: z.string().uuid(),
  doctorId: z.string().uuid(),
  scheduledDate: z.string().transform(val => new Date(val)),
  time: z.string(),
  type: z.enum(['PHYSICAL', 'VIDEO', 'PHONE']),
  reason: z.string().optional(),
  notes: z.string().optional()
});

export const requestLabTestSchema = z.object({
  tests: z.array(z.object({
    testName: z.string().min(1, "Test name is required"),
    testType: z.string().optional(),
    instructions: z.string().optional(),
    urgency: z.enum(["NORMAL", "URGENT", "EMERGENCY"]).default("NORMAL"),
    fastingRequired: z.boolean().default(false)
  })).min(1, "At least one test must be requested")
});

export const uploadLabTestSchema = z.object({
  reportUrl: z.string().url("Invalid report URL")
});

export const reviewLabTestSchema = z.object({
  reviewerComments: z.string().optional(),
  isAbnormal: z.boolean().default(false)
});

export const labTestIdParamSchema = z.object({
  id: z.string().uuid("Invalid consultation ID format"),
  labTestId: z.string().uuid("Invalid lab test ID format")
});
