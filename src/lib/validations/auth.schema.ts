import { z } from 'zod';

export const loginSchema = z.object({
  institutionId: z.string().min(1, 'Please select an institution'),
  role: z.enum(['lender', 'customer']),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(5, 'Password must be at least 5 characters'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
