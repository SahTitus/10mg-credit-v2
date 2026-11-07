// Scope keys share the leading prefix of list and detail keys so one invalidation refreshes related views
export const QUERY_KEYS = {
  INSTITUTION: (id: string) => ['institution', id] as const,
  INSTITUTIONS_ALL: ['institutions'] as const,
  DASHBOARD_SCOPE: (institutionId: string) => ['dashboard', institutionId] as const,
  DASHBOARD_METRICS: (institutionId: string, role: string, customerId?: string) =>
    ['dashboard', institutionId, role, customerId ?? ''] as const,
  LENDER_RECENT_ACTIVITIES: (institutionId: string, limit = 5) =>
    ['dashboard', institutionId, 'activities', 'recent', limit] as const,
  LENDER_ALL_ACTIVITIES: (institutionId: string, category = 'all') =>
    ['dashboard', institutionId, 'activities', 'all', category] as const,
  APPLICATIONS_SCOPE: (institutionId: string) => ['applications', institutionId] as const,
  APPLICATIONS: (institutionId: string, customerId?: string) =>
    customerId
      ? (['applications', institutionId, customerId] as const)
      : (['applications', institutionId] as const),
  APPLICATIONS_PENDING_COUNT: (institutionId: string) =>
    ['applications', institutionId, 'pending-count'] as const,
  APPLICATIONS_PAGINATED: (
    institutionId: string,
    filter?: string,
    search?: string,
    page?: number,
    customerId?: string,
  ) =>
    [
      'applications',
      institutionId,
      'paginated',
      filter ?? 'All',
      search ?? '',
      page ?? 1,
      customerId ?? 'all',
    ] as const,
  APPLICATION_SCOPE: (id: string) => ['application', id] as const,
  APPLICATION_DETAIL: (id: string, institutionId?: string, customerId?: string) =>
    ['application', id, institutionId ?? 'all', customerId ?? 'all'] as const,
  CUSTOMERS_SCOPE: (institutionId: string) => ['customers', institutionId] as const,
  CUSTOMERS: (institutionId: string) => ['customers', institutionId] as const,
  CUSTOMERS_PAGINATED: (institutionId: string, filter?: string, search?: string, page?: number) =>
    ['customers', institutionId, 'paginated', filter ?? 'ALL', search ?? '', page ?? 1] as const,
  CUSTOMER_SCOPE: (id: string) => ['customer', id] as const,
  CUSTOMER_DETAIL: (id: string, institutionId?: string) =>
    ['customer', id, institutionId ?? 'all'] as const,
  LOANS_SCOPE: (institutionId: string) => ['loans', institutionId] as const,
  LOANS: (institutionId: string, customerId?: string) =>
    customerId
      ? (['loans', institutionId, customerId] as const)
      : (['loans', institutionId] as const),
  LOANS_PAGINATED: (
    institutionId: string,
    customerId?: string,
    filter?: string,
    search?: string,
    page?: number,
  ) =>
    [
      'loans',
      institutionId,
      'paginated',
      customerId ?? 'all',
      filter ?? 'ALL',
      search ?? '',
      page ?? 1,
    ] as const,
  LOAN_SCOPE: (id: string) => ['loan', id] as const,
  LOAN_DETAIL: (id: string, institutionId?: string, customerId?: string) =>
    ['loan', id, institutionId ?? 'all', customerId ?? 'all'] as const,
  LOAN_REPAYMENTS_SCOPE: (loanId: string) => ['loan_repayments', loanId] as const,
  LOAN_REPAYMENTS: (loanId: string, institutionId?: string, customerId?: string) =>
    ['loan_repayments', loanId, institutionId ?? 'all', customerId ?? 'all'] as const,
  REPAYMENTS_SCOPE: (institutionId: string) => ['repayments', institutionId] as const,
  REPAYMENTS: (institutionId: string, customerId?: string) =>
    customerId
      ? (['repayments', institutionId, customerId] as const)
      : (['repayments', institutionId] as const),
  REPAYMENTS_PAGINATED: (
    institutionId: string,
    loanFilter?: string,
    search?: string,
    page?: number,
    customerId?: string,
  ) =>
    [
      'repayments',
      institutionId,
      'paginated',
      loanFilter ?? 'ALL',
      search ?? '',
      page ?? 1,
      customerId ?? 'all',
    ] as const,
  REPAYMENT_SCOPE: (id: string) => ['repayment', id] as const,
  REPAYMENT_DETAIL: (id: string, institutionId?: string, customerId?: string) =>
    ['repayment', id, institutionId ?? 'all', customerId ?? 'all'] as const,
  NOTIFICATIONS: (institutionId: string) => ['notifications', institutionId] as const,
} as const;
