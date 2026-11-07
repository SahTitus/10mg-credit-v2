export type UserRole = 'lender' | 'customer';

export interface UserSession {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly role: UserRole;
  readonly institutionId: string;
  readonly customerId?: string;
  readonly business?: string;
}

export interface AuthState {
  readonly isAuthenticated: boolean;
  readonly user: UserSession | null;
  readonly token?: string;
}

export interface LoginCredentials {
  readonly email: string;
  readonly password?: string;
  readonly institutionId: string;
  readonly role: UserRole;
}
