import { z } from 'zod';

export const transferSchema = z.object({
  sacramentId: z.number().positive('Please select a sacrament'),
  quantity: z.number().positive('Quantity must be greater than 0'),
  type: z.enum(['in', 'out'], {
    errorMap: () => ({ message: 'Transfer type must be in or out' })
  }),
  notes: z.string().optional()
});

export const auditSchema = z.object({
  sacramentId: z.number().positive('Please select a sacrament'),
  actualQuantity: z.number().nonnegative('Quantity cannot be negative'),
  notes: z.string().optional()
});

export type TransferFormData = z.infer<typeof transferSchema>;
export type AuditFormData = z.infer<typeof auditSchema>;