export type SidebarMode = 'light' | 'brand' | 'custom';
export type CurrencyCode = 'NGN' | 'GHS' | 'USD' | 'GBP';

export interface Institution {
  readonly id: string;
  name: string;
  short: string;
  initials: string;
  primary: string;
  sidebarMode: SidebarMode;
  sidebarColor: string;
  currency: CurrencyCode;
  interest: number;
  minLoan: number;
  maxLoan: number;
  autoNotify: boolean;
  logo: string;
  domain: string;
}

export type InstitutionSettingsUpdate = Partial<Omit<Institution, 'id' | 'initials' | 'domain'>>;
