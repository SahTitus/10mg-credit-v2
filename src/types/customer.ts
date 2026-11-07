import type { PaginatedResult } from '@/lib/constants/pagination';
import type { LoanApplication } from './application';
import type { Loan } from './loan';

export interface Customer {
  readonly id: string;
  readonly institutionId: string;
  readonly name: string;
  readonly business: string;
  readonly email: string;
  readonly phone: string;
  readonly location?: string;
  readonly joined: string;
  readonly score: number;
}

export interface CustomerDetailView extends Customer {
  applications: LoanApplication[];
  loans: Loan[];
}

export interface CustomerWithStats extends Customer {
  fundedLoansCount: number;
}

export type CustomerDirectoryFilter = 'ALL' | 'ACTIVE' | 'HIGH_SCORE';

export interface CustomerQueryParams {
  institutionId: string;
  filter?: CustomerDirectoryFilter;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface CustomersMetricsSummary {
  totalCustomers: number;
  activeBorrowersCount: number;
  totalPortfolioValue: number;
  fundedLoansCount: number;
  averageScore: number;
}

export interface PaginatedCustomersResponse extends PaginatedResult<CustomerWithStats> {
  summary: CustomersMetricsSummary;
}
