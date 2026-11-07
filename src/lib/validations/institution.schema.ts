import { z } from 'zod';

const isSupportedLogoValue = (value: string): boolean => {
  const trimmed = value.trim();
  if (!trimmed) return true;
  if (trimmed.startsWith('/') || trimmed.startsWith('data:image/')) return true;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

export const institutionSettingsSchema = z
  .object({
    name: z.string().min(2, 'Institution name is required'),
    short: z.string().min(2, 'Short name is required'),
    primary: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Must be a valid hex color (e.g. #2583d9)'),
    sidebarMode: z.enum(['light', 'brand', 'custom']),
    sidebarColor: z
      .string()
      .regex(/^#[0-9a-fA-F]{6}$/, 'Must be a valid hex color')
      .optional(),
    currency: z.enum(['NGN', 'GHS', 'USD', 'GBP']),
    interest: z.number().min(0.1).max(50),
    minLoan: z.number().positive(),
    maxLoan: z.number().positive(),
    autoNotify: z.boolean(),
    logo: z
      .string()
      .refine(isSupportedLogoValue, 'Enter a valid image URL or /assets/... path')
      .optional(),
  })
  .refine((data) => data.maxLoan >= data.minLoan, {
    message: 'Maximum loan must be at least the minimum loan',
    path: ['maxLoan'],
  });

export type InstitutionSettingsFormData = z.infer<typeof institutionSettingsSchema>;
