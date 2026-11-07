export const APPLICATION_STATUSES = {
  PENDING: 'Pending',
  IN_REVIEW: 'In review',
  APPROVED: 'Approved',
  DECLINED: 'Declined',
} as const;

export const APPLICATION_STATUS_FILTERS = [
  'All',
  APPLICATION_STATUSES.PENDING,
  APPLICATION_STATUSES.IN_REVIEW,
  APPLICATION_STATUSES.APPROVED,
  APPLICATION_STATUSES.DECLINED,
] as const;

export type ApplicationStatusFilter = (typeof APPLICATION_STATUS_FILTERS)[number];

export const APPLICATION_PURPOSES = [
  'Medical inventory',
  'Equipment purchase',
  'Pharmacy restock',
  'Clinic supplies',
] as const;

export const APPLICATION_TERMS = [3, 4, 6, 12] as const;

export const APPLICATION_DEFAULTS = {
  amount: 100000,
  purpose: APPLICATION_PURPOSES[0],
  term: APPLICATION_TERMS[0],
} as const;

export const LOAN_STATUSES = {
  ACTIVE: 'Active',
  COMPLETED: 'Completed',
  OVERDUE: 'Overdue',
} as const;

export const LOAN_STATUS_FILTERS = ['All', LOAN_STATUSES.ACTIVE, LOAN_STATUSES.COMPLETED] as const;

export type LoanStatusFilter = (typeof LOAN_STATUS_FILTERS)[number];

export const INSTALLMENT_STATUSES = {
  PAID: 'Paid',
  UPCOMING: 'Upcoming',
  OVERDUE: 'Overdue',
} as const;

export const REPAYMENT_STATUSES = {
  PAID: 'Paid',
  PROCESSING: 'Processing',
  SCHEDULED: 'Scheduled',
} as const;
