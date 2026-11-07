import { API_ENV, type ApiMode } from '@/lib/config/env';
import { mockApiAdapter } from './mock/mock-adapter';
import {
  AppError,
  AuthError,
  ConflictError,
  NotFoundError,
  ValidationError,
} from '@/lib/errors/app-error';

export type RequestParams = Record<string, string | number | boolean | undefined>;

export interface RequestOptions {
  headers?: Record<string, string>;
  params?: RequestParams;
}

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

interface ErrorPayload {
  message?: string;
  details?: Record<string, string[]>;
}

export class ApiClient {
  private readonly baseUrl: string;
  private readonly mode: ApiMode;
  private readonly defaultHeaders: Record<string, string>;

  constructor(baseUrl: string = API_ENV.BASE_URL, mode: ApiMode = API_ENV.MODE) {
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    this.mode = mode;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  public getMode(): ApiMode {
    return this.mode;
  }

  public setAuthHeader(token: string): void {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  public clearAuthHeader(): void {
    delete this.defaultHeaders['Authorization'];
  }

  public buildUrl(endpoint: string, params?: RequestParams): string {
    const normalizedPath = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const base = `${this.baseUrl}${normalizedPath}`;
    if (!params) return base;

    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        searchParams.set(key, String(value));
      }
    }
    const query = searchParams.toString();
    return query ? `${base}?${query}` : base;
  }

  public async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.execute<T>('GET', endpoint, undefined, options);
  }

  public async post<T, B = unknown>(
    endpoint: string,
    body?: B,
    options?: RequestOptions,
  ): Promise<T> {
    return this.execute<T>('POST', endpoint, body, options);
  }

  public async patch<T, B = unknown>(
    endpoint: string,
    body?: B,
    options?: RequestOptions,
  ): Promise<T> {
    return this.execute<T>('PATCH', endpoint, body, options);
  }

  public async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.execute<T>('DELETE', endpoint, undefined, options);
  }

  private async execute<T>(
    method: HttpMethod,
    endpoint: string,
    body?: unknown,
    options?: RequestOptions,
  ): Promise<T> {
    if (this.mode === 'mock') {
      return mockApiAdapter.handle<T>(method, endpoint, body, options?.params);
    }

    const url = this.buildUrl(endpoint, options?.params);
    let response: Response;
    try {
      response = await fetch(url, {
        method,
        headers: {
          ...this.defaultHeaders,
          ...options?.headers,
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });
    } catch (error) {
      throw new AppError(
        error instanceof Error ? error.message : 'Unable to reach the lending service',
        'NETWORK_ERROR',
        503,
      );
    }

    if (!response.ok) {
      await this.throwHttpError(response, endpoint);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  }

  private async throwHttpError(response: Response, endpoint: string): Promise<never> {
    let payload: ErrorPayload | undefined;
    try {
      payload = (await response.json()) as ErrorPayload;
    } catch {
      payload = undefined;
    }

    const message = payload?.message || `Request to ${endpoint} failed (${response.status})`;
    if (response.status === 400 || response.status === 422) {
      throw new ValidationError(message, payload?.details);
    }
    if (response.status === 401) {
      throw new AuthError(message);
    }
    if (response.status === 404) {
      throw new NotFoundError(payload?.message || endpoint);
    }
    if (response.status === 409) {
      throw new ConflictError(message);
    }
    throw new AppError(message, 'INTERNAL_ERROR', response.status);
  }
}

export const globalApiClient = new ApiClient();
