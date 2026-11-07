import { APPLICATION_STATUSES } from '@/lib/constants/application-statuses';
import type { PaginatedResult } from '@/lib/constants/pagination';

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[keyof typeof APPLICATION_STATUSES];

export interface LoanApplication {
  readonly id: string;
  readonly institutionId: string;
  readonly customerId: string;
  readonly name: string;
  readonly business: string;
  readonly email?: string;
  readonly phone?: string;
  readonly location?: string;
  readonly amount: number;
  readonly purpose: string;
  readonly term: number;
  status: ApplicationStatus;
  readonly submitted: string;
  note?: string;
}

export interface CreateApplicationDTO {
  readonly institutionId: string;
  readonly customerId?: string;
  readonly name: string;
  readonly business: string;
  readonly email?: string;
  readonly phone?: string;
  readonly location?: string;
  readonly amount: number;
  readonly purpose: string;
  readonly term: number;
  readonly notes?: string;
}

export interface ApplicationQueryParams {
  institutionId: string;
  customerId?: string;
  status?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface ApplicationsMetricsSummary {
  totalCount: number;
  pendingCount: number;
  pendingValue: number;
  approvedCount: number;
  approvedValue: number;
  declinedCount: number;
  approvalRate: number;
  requestedVolume: number;
}

export interface PaginatedApplicationsResponse extends PaginatedResult<LoanApplication> {
  summary: ApplicationsMetricsSummary;
}
