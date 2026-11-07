import { BaseApiService } from './base-service';
import { LoginCredentials, UserSession } from '@/types/auth';
import { STORAGE_KEYS } from '@/lib/constants/storage-keys';

export class AuthApiService extends BaseApiService {
  public createPortalSession(session: UserSession, role: UserSession['role']): UserSession {
    const db = this.store.getDatabase();

    if (role === 'lender') {
      return {
        ...session,
        id: 'usr-lender-1',
        name: 'Alex Okafor',
        role,
        customerId: undefined,
        business: undefined,
      };
    }

    const normalizedEmail = session.email.trim().toLowerCase();
    const scopedCustomers = db.customers.filter(
      (item) => item.institutionId === session.institutionId,
    );
    const customer =
      scopedCustomers.find((item) => item.email.toLowerCase() === normalizedEmail) ??
      scopedCustomers[0];

    return {
      ...session,
      id: customer?.id ?? 'usr-customer-1',
      name: customer?.name ?? 'Customer',
      role,
      customerId: customer?.id,
      business: customer?.business,
    };
  }

  public async login(credentials: LoginCredentials): Promise<UserSession> {
    await this.delay(350);

    const { email, password, institutionId, role } = credentials;
    if (!email || !password || password.length < 5) {
      this.client.createValidationError(
        'Valid email and password (minimum 5 characters) are required.',
      );
    }

    const db = this.store.getDatabase();
    const institution = db.institutions.find((b) => b.id === institutionId);
    if (!institution) {
      this.client.createNotFoundError('Institution');
    }

    let customerId: string | undefined;
    let business: string | undefined;
    let userName = 'Alex Okafor';
    const normalizedEmail = email.trim().toLowerCase();

    if (role === 'customer') {
      // Unmatched demo sign-ins use the first borrower in the selected institution
      const scopedCustomers = db.customers.filter((c) => c.institutionId === institutionId);
      const customer =
        scopedCustomers.find((c) => c.email.toLowerCase() === normalizedEmail) ??
        scopedCustomers[0];
      if (customer) {
        userName = customer.name;
        customerId = customer.id;
        business = customer.business;
      } else {
        userName = 'Demo Customer';
      }
    }

    const session: UserSession = {
      id: role === 'lender' ? 'usr-lender-1' : (customerId ?? 'usr-customer-1'),
      name: userName,
      email: email.trim(),
      role,
      institutionId,
      customerId,
      business,
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.USER_SESSION, JSON.stringify(session));
      localStorage.setItem(STORAGE_KEYS.CURRENT_INSTITUTION, institutionId);
    }

    return session;
  }

  public async getSession(): Promise<UserSession | null> {
    if (typeof window === 'undefined') return null;

    try {
      const raw = localStorage.getItem(STORAGE_KEYS.USER_SESSION);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  public async logout(): Promise<void> {
    await this.delay(550);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.USER_SESSION);
    }
  }
}

export const authApiService = new AuthApiService();
