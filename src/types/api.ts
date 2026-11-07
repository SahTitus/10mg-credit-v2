export interface ApiResponse<T> {
  readonly success: boolean;
  readonly data: T;
  readonly message?: string;
}

export interface ApiErrorResponse {
  readonly success: false;
  readonly code: string;
  readonly message: string;
  readonly details?: Record<string, string[]>;
}

export interface RecordScope {
  readonly institutionId?: string;
  readonly customerId?: string;
}
