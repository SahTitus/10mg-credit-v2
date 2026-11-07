import { z } from 'zod';

export const creditApplicationSchema = z.object({
  institutionId: z.string().min(1),
  customerId: z.string().min(1),
  name: z.string().min(2, 'Name is required'),
  business: z.string().min(2, 'Business name is required'),
  amount: z.number().positive('Amount must be greater than zero'),
  purpose: z.string().min(2, 'Loan purpose is required'),
  term: z.number().int().min(1).max(24),
  notes: z.string().optional(),
});

export type CreditApplicationFormData = z.infer<typeof creditApplicationSchema>;
