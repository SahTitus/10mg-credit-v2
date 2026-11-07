import { BaseApiService } from './base-service';
import type { RecordScope } from '@/types/api';
import { Customer } from '@/types/customer';
import { LoanApplication } from '@/types/application';
import { Loan } from '@/types/loan';
import { LOAN_STATUSES } from '@/lib/constants/application-statuses';
import { PAGINATION_DEFAULTS, type PaginatedResult } from '@/lib/constants/pagination';

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

export class CustomerApiService extends BaseApiService {
  public async list(institutionId: string, search?: string): Promise<Customer[]> {
    await this.delay(200);
    const db = this.store.getDatabase();
    let customers = db.customers.filter((c) => c.institutionId === institutionId);

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      customers = customers.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.business.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.phone.toLowerCase().includes(q) ||
          (c.location?.toLowerCase().includes(q) ?? false),
      );
    }

    return customers;
  }

  public async listPaginated(params: CustomerQueryParams): Promise<PaginatedCustomersResponse> {
    await this.delay(220);
    const db = this.store.getDatabase();
    const scopedCustomers = db.customers.filter((c) => c.institutionId === params.institutionId);
    const scopedLoans = db.loans.filter((l) => l.institutionId === params.institutionId);

    // Count each borrower once even if they have several active loans
    const activeCustomerIds = new Set(
      scopedLoans.filter((l) => l.status === LOAN_STATUSES.ACTIVE).map((l) => l.customerId),
    );
    const loanCountByCustomer = new Map<string, number>();
    for (const loan of scopedLoans) {
      loanCountByCustomer.set(loan.customerId, (loanCountByCustomer.get(loan.customerId) ?? 0) + 1);
    }

    const totalPortfolioValue = scopedLoans.reduce((sum, l) => sum + l.principal, 0);
    const averageScore =
      scopedCustomers.length === 0
        ? 0
        : Math.round(scopedCustomers.reduce((sum, c) => sum + c.score, 0) / scopedCustomers.length);

    // Directory filters do not change the institution totals shown above the list
    let filtered: CustomerWithStats[] = scopedCustomers.map((c) => ({
      ...c,
      fundedLoansCount: loanCountByCustomer.get(c.id) ?? 0,
    }));

    if (params.filter === 'ACTIVE') {
      filtered = filtered.filter((c) => activeCustomerIds.has(c.id));
    } else if (params.filter === 'HIGH_SCORE') {
      filtered = filtered.filter((c) => c.score >= 750);
    }

    if (params.search && params.search.trim()) {
      const q = params.search.toLowerCase().trim();
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.business.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.phone.toLowerCase().includes(q) ||
          (c.location?.toLowerCase().includes(q) ?? false),
      );
    }

    const paginated = this.paginate(
      filtered,
      params.page ?? PAGINATION_DEFAULTS.INITIAL_PAGE,
      params.pageSize ?? PAGINATION_DEFAULTS.PAGE_SIZE,
    );

    return {
      ...paginated,
      summary: {
        totalCustomers: scopedCustomers.length,
        activeBorrowersCount: activeCustomerIds.size,
        totalPortfolioValue,
        fundedLoansCount: scopedLoans.length,
        averageScore,
      },
    };
  }

  public async getById(
    id: string,
    scope?: Pick<RecordScope, 'institutionId'>,
  ): Promise<CustomerDetailView> {
    await this.delay(200);
    const db = this.store.getDatabase();
    const customer = db.customers.find((c) => c.id === id);
    if (!customer || !this.matchesScope(customer, scope)) {
      this.client.createNotFoundError(`Customer ${id}`);
    }

    const applications = db.applications.filter(
      (a) => a.customerId === id && a.institutionId === customer.institutionId,
    );
    const loans = db.loans.filter(
      (l) => l.customerId === id && l.institutionId === customer.institutionId,
    );

    return {
      ...customer,
      applications,
      loans,
    };
  }
}

export const customerApiService = new CustomerApiService();
