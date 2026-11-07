import { BaseApiService } from './base-service';
import type { RecordScope } from '@/types/api';
import { Loan, LoanScheduleInstallment } from '@/types/loan';
import { Repayment } from '@/types/repayment';
import { INSTALLMENT_STATUSES, LOAN_STATUSES } from '@/lib/constants/application-statuses';
import { PAGINATION_DEFAULTS, type PaginatedResult } from '@/lib/constants/pagination';

export interface LoanQueryParams {
  institutionId: string;
  customerId?: string;
  status?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface LoansMetricsSummary {
  totalCount: number;
  activeCount: number;
  completedCount: number;
  overdueCount: number;
  principalTotal: number;
  outstandingBalance: number;
  totalCollected: number;
  repaymentRate: number;
}

export interface PaginatedLoansResponse extends PaginatedResult<Loan> {
  summary: LoansMetricsSummary;
}

export class LoanApiService extends BaseApiService {
  public async list(institutionId: string, customerId?: string, search?: string): Promise<Loan[]> {
    await this.delay(220);
    return this.queryLoans({ institutionId, customerId, search }).filtered;
  }

  public async listPaginated(params: LoanQueryParams): Promise<PaginatedLoansResponse> {
    await this.delay(220);
    const { filtered, summary } = this.queryLoans(params);
    const paginated = this.paginate(
      filtered,
      params.page ?? PAGINATION_DEFAULTS.INITIAL_PAGE,
      params.pageSize ?? PAGINATION_DEFAULTS.PAGE_SIZE,
    );
    return {
      ...paginated,
      summary,
    };
  }

  private queryLoans(params: LoanQueryParams): {
    filtered: Loan[];
    summary: LoansMetricsSummary;
  } {
    const db = this.store.getDatabase();
    let scoped = db.loans.filter((l) => l.institutionId === params.institutionId);

    if (params.customerId) {
      scoped = scoped.filter((l) => l.customerId === params.customerId);
    }

    // Portfolio totals stay scoped to the institution and borrower, before list filters
    const activeCount = scoped.filter((l) => l.status === LOAN_STATUSES.ACTIVE).length;
    const completedCount = scoped.filter((l) => l.status === LOAN_STATUSES.COMPLETED).length;
    const overdueCount = scoped.filter((l) => l.status === LOAN_STATUSES.OVERDUE).length;
    const principalTotal = scoped.reduce((sum, l) => sum + l.principal, 0);
    const outstandingBalance = scoped.reduce((sum, l) => sum + Math.max(0, l.totalDue - l.paid), 0);
    const totalCollected = scoped.reduce((sum, l) => sum + l.paid, 0);
    const totalDueSum = scoped.reduce((sum, l) => sum + l.totalDue, 0);
    const repaymentRate = totalDueSum ? Math.round((totalCollected / totalDueSum) * 100) : 0;

    let filtered = [...scoped];
    if (params.status && params.status !== 'ALL' && params.status !== 'All') {
      if (params.customerId && params.status === LOAN_STATUSES.ACTIVE) {
        // Customers still see overdue loans in the Active filter
        filtered = filtered.filter((l) => l.status !== LOAN_STATUSES.COMPLETED);
      } else {
        filtered = filtered.filter((l) => l.status === params.status);
      }
    }

    if (params.search && params.search.trim()) {
      const q = params.search.toLowerCase().trim();
      filtered = filtered.filter(
        (l) =>
          l.id.toLowerCase().includes(q) ||
          l.borrower.toLowerCase().includes(q) ||
          l.business.toLowerCase().includes(q),
      );
    }

    filtered.sort((a, b) => b.issued.localeCompare(a.issued));

    return {
      filtered,
      summary: {
        totalCount: scoped.length,
        activeCount,
        completedCount,
        overdueCount,
        principalTotal,
        outstandingBalance,
        totalCollected,
        repaymentRate,
      },
    };
  }

  public async getById(id: string, scope?: RecordScope): Promise<Loan> {
    await this.delay(200);
    const db = this.store.getDatabase();
    const loan = db.loans.find((l) => l.id === id);
    if (!loan || !this.matchesScope(loan, scope)) {
      this.client.createNotFoundError(`Loan ${id}`);
    }
    return loan;
  }

  public async getRepayments(loanId: string, scope?: RecordScope): Promise<Repayment[]> {
    await this.delay(200);
    const db = this.store.getDatabase();
    const loan = db.loans.find((l) => l.id === loanId);
    if (!loan || !this.matchesScope(loan, scope)) {
      this.client.createNotFoundError(`Loan ${loanId}`);
    }
    return db.repayments
      .filter(
        (r) =>
          r.loanId === loanId &&
          r.institutionId === loan.institutionId &&
          (!scope?.customerId || r.customerId === scope.customerId),
      )
      .sort((a, b) => b.date.localeCompare(a.date));
  }

  public getSchedule(loan: Loan): LoanScheduleInstallment[] {
    const installments: LoanScheduleInstallment[] = [];
    // Rounding each instalment can leave a small difference from the loan total
    const monthlyTotal = Math.round(loan.totalDue / loan.term);
    const monthlyPrincipal = Math.round(loan.principal / loan.term);
    const monthlyInterest = monthlyTotal - monthlyPrincipal;

    const issuedDate = new Date(loan.issued);
    const paidPortion = loan.paid;
    let accumulated = 0;

    for (let i = 1; i <= loan.term; i++) {
      accumulated += monthlyTotal;
      // Billing uses fixed 30-day intervals, so dates can drift from calendar months
      const dueDate = new Date(issuedDate.getTime() + i * 30 * 86400000).toISOString().slice(0, 10);

      // An instalment is paid only when the scheduled amount up to that date is covered
      const status =
        accumulated <= paidPortion
          ? INSTALLMENT_STATUSES.PAID
          : new Date(dueDate).getTime() < Date.now()
            ? INSTALLMENT_STATUSES.OVERDUE
            : INSTALLMENT_STATUSES.UPCOMING;

      installments.push({
        number: i,
        dueDate,
        amount: monthlyTotal,
        principalPortion: monthlyPrincipal,
        interestPortion: monthlyInterest,
        status,
      });
    }

    return installments;
  }
}

export const loanApiService = new LoanApiService();
