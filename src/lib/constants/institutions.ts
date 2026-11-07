import { CurrencyCode, Institution } from '@/types/institution';

export const INSTITUTION_BRAND_COLORS = [
  '#2583d9',
  '#11756f',
  '#365ccf',
  '#8052a8',
  '#b36b43',
  '#253c58',
] as const;

export const CURRENCY_SYMBOLS: Readonly<Record<CurrencyCode, string>> = {
  NGN: '₦',
  GHS: 'GH₵',
  USD: '$',
  GBP: '£',
};

export const CURRENCY_OPTIONS: ReadonlyArray<{
  readonly code: CurrencyCode;
  readonly symbol: string;
  readonly label: string;
}> = [
  { code: 'NGN', symbol: '₦', label: 'NGN (₦) — Nigerian Naira' },
  { code: 'GHS', symbol: 'GH₵', label: 'GHS (GH₵) — Ghanaian Cedi' },
  { code: 'USD', symbol: '$', label: 'USD ($) — US Dollar' },
  { code: 'GBP', symbol: '£', label: 'GBP (£) — Pound Sterling' },
] as const;

export const DEFAULT_INSTITUTION_LOGOS: Readonly<Record<string, string>> = {
  bluehaven: '/assets/logo-bluehaven.svg',
  meridian: '/assets/logo-meridian.svg',
};

export const DEFAULT_INSTITUTIONS: readonly Institution[] = [
  {
    id: 'bluehaven',
    name: 'Bluehaven Health Finance',
    short: 'Bluehaven',
    initials: 'BH',
    primary: '#1776ce',
    sidebarMode: 'light',
    sidebarColor: '#1b344f',
    currency: 'NGN',
    interest: 9.5,
    minLoan: 50000,
    maxLoan: 5000000,
    autoNotify: true,
    logo: DEFAULT_INSTITUTION_LOGOS.bluehaven,
    domain: 'credit.bluehaven.example',
  },
  {
    id: 'meridian',
    name: 'Meridian Medical Capital',
    short: 'Meridian',
    initials: 'MM',
    primary: '#11756f',
    sidebarMode: 'brand',
    sidebarColor: '#144f54',
    currency: 'GHS',
    interest: 10.5,
    minLoan: 1000,
    maxLoan: 150000,
    autoNotify: true,
    logo: DEFAULT_INSTITUTION_LOGOS.meridian,
    domain: 'apply.meridian.example',
  },
] as const;
