import { z } from "zod";
import { paginationQuerySchema } from "./pagination.dtos";

export const getPublicDoctorsQuerySchema = paginationQuerySchema.extend({
  specialty: z.string().optional(),
  availableToday: z.string().optional().transform(val => val === "true"),
  minFee: z.string().optional().transform(val => val ? Number(val) : undefined),
  maxFee: z.string().optional().transform(val => val ? Number(val) : undefined),
  experienceYears: z.string().optional().transform(val => val ? Number(val) : undefined),
  minRating: z.string().optional().transform(val => val ? Number(val) : undefined),
  language: z.string().optional(),
});
