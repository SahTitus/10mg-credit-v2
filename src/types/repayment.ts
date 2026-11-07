import { REPAYMENT_STATUSES } from '@/lib/constants/application-statuses';
import type { PaginatedResult } from '@/lib/constants/pagination';

export type RepaymentStatus = (typeof REPAYMENT_STATUSES)[keyof typeof REPAYMENT_STATUSES];

export interface Repayment {
  readonly id: string;
  readonly institutionId: string;
  readonly loanId: string;
  readonly customerId: string;
  readonly name: string;
  readonly business: string;
  readonly amount: number;
  readonly date: string;
  readonly status: RepaymentStatus;
}

export interface RecordRepaymentDTO {
  readonly institutionId: string;
  readonly loanId: string;
  readonly customerId: string;
  readonly amount: number;
}

export interface RepaymentQueryParams {
  institutionId: string;
  customerId?: string;
  loanId?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface RepaymentsMetricsSummary {
  totalCollected: number;
  paymentsCount: number;
  collectionRate: number;
  averagePayment: number;
  outstandingBalance: number;
  activeFacilitiesCount: number;
}

export interface PaginatedRepaymentsResponse extends PaginatedResult<Repayment> {
  summary: RepaymentsMetricsSummary;
}
