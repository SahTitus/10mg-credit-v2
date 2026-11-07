import { BaseApiService } from './base-service';
import type { RecordScope } from '@/types/api';
import { RecordRepaymentDTO, Repayment } from '@/types/repayment';
import { APP_ROUTES } from '@/lib/constants/routes';
import { LOAN_STATUSES, REPAYMENT_STATUSES } from '@/lib/constants/application-statuses';
import { PAGINATION_DEFAULTS, type PaginatedResult } from '@/lib/constants/pagination';
import { ConflictError } from '@/lib/errors/app-error';

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

export class RepaymentApiService extends BaseApiService {
  public async list(
    institutionId: string,
    search?: string,
    customerId?: string,
  ): Promise<Repayment[]> {
    await this.delay(200);
    return this.queryRepayments({ institutionId, search, customerId }).filtered;
  }

  public async listPaginated(params: RepaymentQueryParams): Promise<PaginatedRepaymentsResponse> {
    await this.delay(220);
    const { filtered, summary } = this.queryRepayments(params);
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

  private queryRepayments(params: RepaymentQueryParams): {
    filtered: Repayment[];
    summary: RepaymentsMetricsSummary;
  } {
    const db = this.store.getDatabase();
    let scopedRecords = db.repayments.filter((r) => r.institutionId === params.institutionId);
    let scopedLoans = db.loans.filter((l) => l.institutionId === params.institutionId);

    if (params.customerId) {
      scopedRecords = scopedRecords.filter((r) => r.customerId === params.customerId);
      scopedLoans = scopedLoans.filter((l) => l.customerId === params.customerId);
    }

    // A loan filter narrows the list but leaves portfolio totals unchanged
    const totalCollected = scopedRecords.reduce((sum, r) => sum + r.amount, 0);
    const totalScheduled = scopedLoans.reduce((sum, l) => sum + l.totalDue, 0);
    const collectionRate = totalScheduled ? Math.round((totalCollected / totalScheduled) * 100) : 0;
    const averagePayment = scopedRecords.length
      ? Math.round(totalCollected / scopedRecords.length)
      : 0;
    const outstandingBalance = scopedLoans.reduce(
      (sum, l) => sum + Math.max(0, l.totalDue - l.paid),
      0,
    );
    const activeFacilitiesCount = scopedLoans.filter(
      (l) => l.status === LOAN_STATUSES.ACTIVE,
    ).length;

    let filtered = [...scopedRecords];
    if (params.loanId && params.loanId !== 'ALL') {
      filtered = filtered.filter((r) => r.loanId === params.loanId);
    }

    if (params.search && params.search.trim()) {
      const q = params.search.toLowerCase().trim();
      filtered = filtered.filter(
        (r) =>
          r.id.toLowerCase().includes(q) ||
          r.name.toLowerCase().includes(q) ||
          r.business.toLowerCase().includes(q) ||
          r.loanId.toLowerCase().includes(q),
      );
    }

    filtered.sort((a, b) => b.date.localeCompare(a.date));

    return {
      filtered,
      summary: {
        totalCollected,
        paymentsCount: scopedRecords.length,
        collectionRate,
        averagePayment,
        outstandingBalance,
        activeFacilitiesCount,
      },
    };
  }

  public async getById(id: string, scope?: RecordScope): Promise<Repayment> {
    await this.delay(150);
    const db = this.store.getDatabase();
    const record = db.repayments.find((r) => r.id === id);
    if (!record || !this.matchesScope(record, scope)) {
      this.client.createNotFoundError(`Repayment ${id}`);
    }
    return record;
  }

  public async record(dto: RecordRepaymentDTO): Promise<Repayment> {
    await this.delay(350);
    if (!Number.isFinite(dto.amount) || dto.amount <= 0) {
      this.client.createValidationError('Payment amount must be greater than zero.');
    }

    let createdRepayment: Repayment | undefined;

    this.store.updateDatabase((db) => {
      const loan = db.loans.find((l) => l.id === dto.loanId);
      if (!loan) {
        this.client.createNotFoundError(`Loan ${dto.loanId}`);
      }

      if (loan.institutionId !== dto.institutionId) {
        this.client.createValidationError(
          `Loan ${dto.loanId} does not belong to this institution.`,
        );
      }

      if (loan.customerId !== dto.customerId) {
        this.client.createValidationError(
          `Loan ${dto.loanId} does not belong to the specified customer.`,
        );
      }

      const remaining = Math.max(0, loan.totalDue - loan.paid);
      if (loan.status === LOAN_STATUSES.COMPLETED || remaining <= 0) {
        throw new ConflictError(`Loan ${dto.loanId} is already settled.`);
      }

      if (dto.amount > remaining) {
        this.client.createValidationError(
          `Payment amount exceeds the remaining balance of ${remaining}.`,
        );
      }

      const nextSeq = db.repayments.length + 101;
      const id = `RP-${Date.now().toString().slice(-4)}${nextSeq}`;
      const repayment: Repayment = {
        id,
        institutionId: dto.institutionId,
        loanId: dto.loanId,
        customerId: dto.customerId,
        name: loan.borrower,
        business: loan.business,
        amount: dto.amount,
        date: new Date().toISOString().slice(0, 10),
        status: REPAYMENT_STATUSES.PAID,
      };

      // Keep the receipt, loan balance and notification in one store write
      loan.paid += dto.amount;
      if (loan.paid >= loan.totalDue) {
        loan.status = LOAN_STATUSES.COMPLETED;
      }

      db.repayments.unshift(repayment);
      createdRepayment = repayment;

      db.notifications.unshift({
        id: `notif-${Date.now()}`,
        institutionId: dto.institutionId,
        title: 'Payment processed',
        message: `${repayment.business} recorded payment for ${repayment.loanId}`,
        time: 'Just now',
        read: false,
        category: 'repayment',
        targetRoute: APP_ROUTES.LENDER.REPAYMENTS,
        targetId: id,
      });

      return db;
    });

    if (!createdRepayment) {
      this.client.createNotFoundError('Failed to record repayment');
    }
    return createdRepayment;
  }
}

export const repaymentApiService = new RepaymentApiService();
