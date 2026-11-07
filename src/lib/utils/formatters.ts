import { CURRENCY_SYMBOLS } from '@/lib/constants/institutions';
import { CurrencyCode } from '@/types/institution';

export function getCurrencySymbol(currency: CurrencyCode = 'NGN'): string {
  return CURRENCY_SYMBOLS[currency] ?? '₦';
}

export function formatCurrency(
  val: number | string | undefined,
  currency: CurrencyCode = 'NGN',
  compact = false,
): string {
  const num = Number(val) || 0;
  const sym = getCurrencySymbol(currency);

  if (compact) {
    const abs = Math.abs(num);
    if (abs >= 1_000_000) {
      return `${sym}${(num / 1_000_000).toFixed(1)}m`;
    }
    if (abs >= 1_000) {
      const formatted = (num / 1_000).toFixed(abs >= 100_000 ? 0 : 1);
      return `${sym}${formatted.endsWith('.0') ? formatted.slice(0, -2) : formatted}k`;
    }
  }

  return `${sym}${Math.round(num).toLocaleString('en-GB')}`;
}

export function formatDate(str: string | undefined): string {
  if (!str) return '—';
  const d = new Date(str);
  return Number.isNaN(d.getTime())
    ? '—'
    : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatShortDate(str: string | undefined): string {
  if (!str) return '—';
  const d = new Date(str);
  return Number.isNaN(d.getTime())
    ? '—'
    : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
}

export function getInitials(name: string | undefined): string {
  return String(name || '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((v) => v[0])
    .join('')
    .toUpperCase();
}

export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}
