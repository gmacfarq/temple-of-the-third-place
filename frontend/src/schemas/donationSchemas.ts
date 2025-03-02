import { z } from 'zod';

export const donationItemSchema = z.object({
  sacramentId: z.number().positive('Please select a sacrament'),
  quantity: z.number().positive('Quantity must be greater than 0'),
  amount: z.number().positive('Amount must be greater than 0')
});

export const donationFormSchema = z.object({
  memberId: z.number().positive('Please select a member'),
  type: z.enum(['cash', 'card', 'other'], {
    errorMap: () => ({ message: 'Please select a valid payment type' })
  }),
  items: z.array(donationItemSchema).nonempty('At least one item is required'),
  notes: z.string().optional()
});

export type DonationFormData = z.infer<typeof donationFormSchema>;