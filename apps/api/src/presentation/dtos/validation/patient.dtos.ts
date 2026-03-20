import { z } from "zod";

export const getPatientsQuerySchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
  gender: z.string().optional(),
  page: z.string().transform(val => parseInt(val) || 1),
  limit: z.string().transform(val => parseInt(val) || 10)
});
