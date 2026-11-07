export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
  },
  INSTITUTIONS: {
    BY_ID: (id: string) => `/institutions/${id}`,
  },
  DASHBOARD: {
    SUMMARY: '/dashboard/summary',
  },
  APPLICATIONS: {
    BASE: '/applications',
    BY_ID: (id: string) => `/applications/${id}`,
    STATUS: (id: string) => `/applications/${id}/status`,
  },
  CUSTOMERS: {
    BASE: '/customers',
    BY_ID: (id: string) => `/customers/${id}`,
  },
  LOANS: {
    BASE: '/loans',
    BY_ID: (id: string) => `/loans/${id}`,
    REPAYMENTS: (id: string) => `/loans/${id}/repayments`,
  },
  REPAYMENTS: {
    BASE: '/repayments',
  },
  NOTIFICATIONS: {
    BASE: '/notifications',
  },
} as const;
