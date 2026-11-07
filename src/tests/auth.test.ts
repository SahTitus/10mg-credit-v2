import { describe, it, expect } from 'vitest';
import { authApiService } from '@/lib/api/auth-service';

describe('Auth API Service', () => {
  it('authenticates valid lender credentials', async () => {
    const session = await authApiService.login({
      email: 'demo@10mg.ai',
      password: 'demo12345',
      institutionId: 'bluehaven',
      role: 'lender',
    });

    expect(session.institutionId).toBe('bluehaven');
    expect(session.role).toBe('lender');
    expect(session.name).toBe('Alex Okafor');
  });

  it('authenticates valid customer credentials with institution-scoped profile', async () => {
    const session = await authApiService.login({
      email: 'customer@example.com',
      password: 'demo12345',
      institutionId: 'meridian',
      role: 'customer',
    });

    expect(session.institutionId).toBe('meridian');
    expect(session.role).toBe('customer');
    expect(session.customerId).toBe('meridian-cus-1');
    expect(session.business).toBe('Cedar Medical Centre');
  });

  it('matches a seeded borrower account when signing in with their registered email', async () => {
    const session = await authApiService.login({
      email: 'kwame@medixpharmacy.com.gh',
      password: 'demo12345',
      institutionId: 'meridian',
      role: 'customer',
    });

    expect(session.customerId).toBe('meridian-cus-2');
    expect(session.name).toBe('Kwame Osei');
    expect(session.business).toBe('Medix Pharmacy');
  });

  it('rejects short passwords', async () => {
    await expect(
      authApiService.login({
        email: 'test@example.com',
        password: '123',
        institutionId: 'bluehaven',
        role: 'lender',
      }),
    ).rejects.toThrow();
  });
});
