import { BaseApiService } from './base-service';
import { API_ENDPOINTS } from '@/lib/constants/api-endpoints';
import type { LoginCredentials, UserSession } from '@/types/auth';

export class AuthApiService extends BaseApiService {
  public createPortalSession(session: UserSession, role: UserSession['role']): UserSession {
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

    return {
      ...session,
      id: session.customerId || 'usr-customer-1',
      name: session.name || 'Customer',
      role,
      customerId: session.customerId,
      business: session.business,
    };
  }

  public async login(credentials: LoginCredentials): Promise<UserSession> {
    return this.client.post<UserSession>(API_ENDPOINTS.AUTH.LOGIN, credentials);
  }

  public async getSession(): Promise<UserSession | null> {
    return this.client.get<UserSession | null>(API_ENDPOINTS.AUTH.SESSION);
  }

  public async logout(): Promise<void> {
    return this.client.post<void>(API_ENDPOINTS.AUTH.LOGOUT);
  }
}

export const authApiService = new AuthApiService();
