import { z } from "zod";
import { paginationQuerySchema } from "./pagination.dtos";

export const getPaymentsQuerySchema = paginationQuerySchema.extend({
  status: z.string().optional(),
  paymentMethod: z.string().optional(),
});

export const getFinancialActivityQuerySchema = paginationQuerySchema.extend({
  status: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  method: z.string().optional(),
});
