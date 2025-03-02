const { z } = require('zod');

// Schema for inventory transfers
const transferSchema = z.object({
  body: z.object({
    sacramentId: z.number().positive('Sacrament ID is required'),
    quantity: z.number().positive('Quantity must be positive'),
    type: z.enum(['in', 'out'], {
      errorMap: () => ({ message: 'Transfer type must be in or out' })
    }),
    notes: z.string().optional()
  })
});

// Schema for inventory audits
const auditSchema = z.object({
  body: z.object({
    sacramentId: z.number().positive('Sacrament ID is required'),
    actualQuantity: z.number().nonnegative('Quantity cannot be negative'),
    notes: z.string().optional()
  })
});

module.exports = {
  transferSchema,
  auditSchema
};