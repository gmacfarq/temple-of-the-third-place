const { z } = require('zod');

// Schema for donation items
const donationItemSchema = z.object({
  sacramentId: z.number().positive('Sacrament ID must be positive'),
  quantity: z.number().positive('Quantity must be positive'),
  amount: z.number().positive('Amount must be positive')
});

// Schema for creating a donation
const createDonationSchema = z.object({
  body: z.object({
    memberId: z.number().positive('Member ID is required'),
    type: z.enum(['cash', 'card', 'other'], {
      errorMap: () => ({ message: 'Payment type must be cash, card, or other' })
    }),
    items: z.array(donationItemSchema).nonempty('At least one item is required'),
    notes: z.string().optional()
  })
});

module.exports = {
  createDonationSchema
};