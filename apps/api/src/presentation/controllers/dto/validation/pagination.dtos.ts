import { z } from "zod";

export const paginationQuerySchema = z.object({
  page: z.string().optional().transform(val => (val ? parseInt(val) : 1)).pipe(z.number().min(1)),
  limit: z.string().optional().transform(val => (val ? parseInt(val) : 10)).pipe(z.number().min(1).max(100)),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc')
});

export type PaginationQueryDto = z.infer<typeof paginationQuerySchema>;
