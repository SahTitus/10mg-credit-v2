import { AppError, NotFoundError } from './app-error';

export interface UserFacingError {
  readonly title: string;
  readonly message: string;
}

export function isNotFoundError(error: unknown): boolean {
  return (
    error instanceof NotFoundError ||
    (error instanceof AppError && (error.code === 'NOT_FOUND' || error.statusCode === 404))
  );
}

export function getErrorMessage(
  error: unknown,
  fallback = 'Unable to load data. Please try again.',
): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return fallback;
}

export function formatErrorForUser(error: unknown): UserFacingError {
  if (error instanceof AppError) {
    return {
      title: error.name.replace(/([A-Z])/g, ' $1').trim(),
      message: error.message,
    };
  }

  if (error instanceof Error) {
    return {
      title: 'Action Failed',
      message: error.message,
    };
  }

  return {
    title: 'Unexpected Error',
    message: 'An unexpected system error occurred. Please try again.',
  };
}
