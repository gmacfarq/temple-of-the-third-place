import { z } from 'zod';

export const transferSchema = z.object({
  sacramentId: z.number().positive('Please select a sacrament'),
  quantity: z.number().positive('Quantity must be greater than 0'),
  type: z.enum(['to_active', 'to_storage', 'add_storage'], {
    errorMap: () => ({ message: 'Transfer type must be to_active, to_storage, or add_storage' })
  }),
  notes: z.string().optional()
});

export const auditSchema = z.object({
  sacramentId: z.number().positive('Please select a sacrament'),
  actualStorage: z.number().nonnegative('Storage quantity cannot be negative'),
  actualActive: z.number().nonnegative('Active quantity cannot be negative'),
  notes: z.string().optional()
});

export type TransferFormData = z.infer<typeof transferSchema>;
export type AuditFormData = z.infer<typeof auditSchema>;