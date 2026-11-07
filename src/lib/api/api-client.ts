import { AppError, NotFoundError, ValidationError, AuthError } from '@/lib/errors/app-error';

export interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean | undefined>;
}

export class ApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseUrl = '/api/v2') {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
  }

  public setAuthHeader(token: string): void {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  public clearAuthHeader(): void {
    delete this.defaultHeaders['Authorization'];
  }

  public async simulateLatency(ms = 300): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  public handleError(error: unknown): never {
    if (error instanceof AppError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new AppError(error.message, 'INTERNAL_ERROR', 500);
    }
    throw new AppError('An unknown error occurred', 'INTERNAL_ERROR', 500);
  }

  public createNotFoundError(resource: string): never {
    throw new NotFoundError(resource);
  }

  public createValidationError(message: string, details?: Record<string, string[]>): never {
    throw new ValidationError(message, details);
  }

  public createAuthError(message?: string): never {
    throw new AuthError(message);
  }
}

export const globalApiClient = new ApiClient();
