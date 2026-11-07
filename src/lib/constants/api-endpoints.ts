export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    SESSION: '/auth/session',
    LOGOUT: '/auth/logout',
  },
  INSTITUTIONS: {
    BASE: '/institutions',
    BY_ID: (id: string) => `/institutions/${encodeURIComponent(id)}`,
  },
  DASHBOARD: {
    LENDER_METRICS: '/dashboard/lender/metrics',
    CUSTOMER_METRICS: '/dashboard/customer/metrics',
    ACTIVITIES: '/dashboard/lender/activities',
  },
  APPLICATIONS: {
    BASE: '/applications',
    PAGINATED: '/applications/paginated',
    PENDING_COUNT: '/applications/pending-count',
    BY_ID: (id: string) => `/applications/${encodeURIComponent(id)}`,
    STATUS: (id: string) => `/applications/${encodeURIComponent(id)}/status`,
    WITHDRAW: (id: string) => `/applications/${encodeURIComponent(id)}/withdraw`,
  },
  CUSTOMERS: {
    BASE: '/customers',
    PAGINATED: '/customers/paginated',
    BY_ID: (id: string) => `/customers/${encodeURIComponent(id)}`,
  },
  LOANS: {
    BASE: '/loans',
    PAGINATED: '/loans/paginated',
    BY_ID: (id: string) => `/loans/${encodeURIComponent(id)}`,
    REPAYMENTS: (id: string) => `/loans/${encodeURIComponent(id)}/repayments`,
  },
  REPAYMENTS: {
    BASE: '/repayments',
    PAGINATED: '/repayments/paginated',
    BY_ID: (id: string) => `/repayments/${encodeURIComponent(id)}`,
  },
  NOTIFICATIONS: {
    BASE: '/notifications',
    MARK_READ: (id: string) => `/notifications/${encodeURIComponent(id)}/read`,
    MARK_ALL_READ: '/notifications/read-all',
  },
} as const;
