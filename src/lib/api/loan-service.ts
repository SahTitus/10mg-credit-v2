import { BaseApiService } from './base-service';
import { API_ENDPOINTS } from '@/lib/constants/api-endpoints';
import { INSTALLMENT_STATUSES } from '@/lib/constants/application-statuses';
import type { RecordScope } from '@/types/api';
import type {
  Loan,
  LoanQueryParams,
  LoansMetricsSummary,
  LoanScheduleInstallment,
  PaginatedLoansResponse,
} from '@/types/loan';
import type { Repayment } from '@/types/repayment';

export type { LoanQueryParams, LoansMetricsSummary, PaginatedLoansResponse };

export class LoanApiService extends BaseApiService {
  public async list(institutionId: string, customerId?: string, search?: string): Promise<Loan[]> {
    return this.client.get<Loan[]>(API_ENDPOINTS.LOANS.BASE, {
      params: { institutionId, customerId, search },
    });
  }

  public async listPaginated(params: LoanQueryParams): Promise<PaginatedLoansResponse> {
    return this.client.get<PaginatedLoansResponse>(API_ENDPOINTS.LOANS.PAGINATED, {
      params: {
        institutionId: params.institutionId,
        customerId: params.customerId,
        status: params.status,
        search: params.search,
        page: params.page,
        pageSize: params.pageSize,
      },
    });
  }

  public async getById(id: string, scope?: RecordScope): Promise<Loan> {
    return this.client.get<Loan>(API_ENDPOINTS.LOANS.BY_ID(id), {
      params: {
        institutionId: scope?.institutionId,
        customerId: scope?.customerId,
      },
    });
  }

  public async getRepayments(loanId: string, scope?: RecordScope): Promise<Repayment[]> {
    return this.client.get<Repayment[]>(API_ENDPOINTS.LOANS.REPAYMENTS(loanId), {
      params: {
        institutionId: scope?.institutionId,
        customerId: scope?.customerId,
      },
    });
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
