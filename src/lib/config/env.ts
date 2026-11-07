export type ApiMode = 'mock' | 'http';

const FALLBACK_API_BASE_URL = '/api/v2';
const FALLBACK_API_MODE: ApiMode = 'mock';

function normalizeBaseUrl(rawUrl: string | undefined): string {
  const trimmed = rawUrl?.trim();
  if (!trimmed) return FALLBACK_API_BASE_URL;
  return trimmed.endsWith('/') ? trimmed.slice(0, -1) : trimmed;
}

function resolveApiMode(rawMode: string | undefined): ApiMode {
  return rawMode?.trim().toLowerCase() === 'http' ? 'http' : FALLBACK_API_MODE;
}

// Switch from local mock storage to a live backend by setting NEXT_PUBLIC_API_BASE_URL and NEXT_PUBLIC_API_MODE=http
export const API_ENV = {
  BASE_URL: normalizeBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL),
  MODE: resolveApiMode(process.env.NEXT_PUBLIC_API_MODE),
} as const;
