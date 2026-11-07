export const PORTAL_PREFIXES = {
  LENDER: '/lender',
  CUSTOMER: '/customer',
} as const;

export const APP_ROUTES = {
  AUTH: {
    LOGIN: '/login',
  },
  LENDER: {
    OVERVIEW: '/lender/overview',
    APPLICATIONS: '/lender/applications',
    CUSTOMERS: '/lender/customers',
    LOANS: '/lender/loans',
    REPAYMENTS: '/lender/repayments',
    SETTINGS: '/lender/settings',
  },
  CUSTOMER: {
    OVERVIEW: '/customer/overview',
    APPLY: '/customer/apply',
    APPLICATIONS: '/customer/applications',
    LOANS: '/customer/loans',
    PAYMENTS: '/customer/payments',
    PROFILE: '/customer/profile',
  },
} as const;

export type AppRoute =
  | (typeof APP_ROUTES.AUTH)[keyof typeof APP_ROUTES.AUTH]
  | (typeof APP_ROUTES.LENDER)[keyof typeof APP_ROUTES.LENDER]
  | (typeof APP_ROUTES.CUSTOMER)[keyof typeof APP_ROUTES.CUSTOMER];

export const APP_ROUTE_BUILDERS = {
  LENDER: {
    APPLICATION: (id: string) => `${APP_ROUTES.LENDER.APPLICATIONS}/${encodeURIComponent(id)}`,
    CUSTOMER: (id: string) => `${APP_ROUTES.LENDER.CUSTOMERS}/${encodeURIComponent(id)}`,
    LOAN: (id: string) => `${APP_ROUTES.LENDER.LOANS}/${encodeURIComponent(id)}`,
    REPAYMENT: (id: string) => `${APP_ROUTES.LENDER.REPAYMENTS}/${encodeURIComponent(id)}`,
    NEW_APPLICATION: `${APP_ROUTES.LENDER.APPLICATIONS}?new=true`,
  },
  CUSTOMER: {
    LOAN: (id: string) => `${APP_ROUTES.CUSTOMER.LOANS}/${encodeURIComponent(id)}`,
    APPLICATION: (id: string) => `${APP_ROUTES.CUSTOMER.APPLICATIONS}/${encodeURIComponent(id)}`,
    PAYMENT: (id: string) => `${APP_ROUTES.CUSTOMER.PAYMENTS}/${encodeURIComponent(id)}`,
  },
} as const;

export const APP_ROUTE_LABELS: Readonly<Record<AppRoute, string>> = {
  [APP_ROUTES.AUTH.LOGIN]: 'Login',
  [APP_ROUTES.LENDER.OVERVIEW]: 'Overview',
  [APP_ROUTES.LENDER.APPLICATIONS]: 'Applications',
  [APP_ROUTES.LENDER.CUSTOMERS]: 'Customers',
  [APP_ROUTES.LENDER.LOANS]: 'Loans',
  [APP_ROUTES.LENDER.REPAYMENTS]: 'Repayments',
  [APP_ROUTES.LENDER.SETTINGS]: 'Institution settings',
  [APP_ROUTES.CUSTOMER.OVERVIEW]: 'Overview',
  [APP_ROUTES.CUSTOMER.APPLY]: 'Apply for credit',
  [APP_ROUTES.CUSTOMER.APPLICATIONS]: 'Applications',
  [APP_ROUTES.CUSTOMER.LOANS]: 'My loans',
  [APP_ROUTES.CUSTOMER.PAYMENTS]: 'Payments',
  [APP_ROUTES.CUSTOMER.PROFILE]: 'Profile',
};
