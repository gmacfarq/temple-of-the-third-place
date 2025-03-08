const { z } = require('zod');

// Schema for inventory transfers
const transferSchema = z.object({
  body: z.object({
    sacramentId: z.number().positive('Sacrament ID is required'),
    quantity: z.number().positive('Quantity must be positive'),
    type: z.enum(['to_active', 'to_storage', 'add_storage', 'remove_storage'], {
      errorMap: () => ({ message: 'Transfer type must be to_active, to_storage, add_storage, or remove_storage' })
    }),
    notes: z.string().optional()
  })
});

// Schema for inventory audits
const auditSchema = z.object({
  body: z.object({
    sacramentId: z.number().positive('Sacrament ID is required'),
    actualStorage: z.number().nonnegative('Storage quantity cannot be negative'),
    actualActive: z.number().nonnegative('Active quantity cannot be negative'),
    notes: z.string().optional()
  })
});

module.exports = {
  transferSchema,
  auditSchema
};