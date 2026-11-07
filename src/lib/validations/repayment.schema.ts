import { z } from 'zod';

export const recordRepaymentSchema = z.object({
  loanId: z.string().min(1, 'Please select a loan'),
  amount: z.number().positive('Amount must be positive'),
  institutionId: z.string().min(1),
  customerId: z.string().min(1),
});

export type RecordRepaymentFormData = z.infer<typeof recordRepaymentSchema>;
