import { MockStorageAdapter } from '../mock-store';
import { matchesScope, paginate } from './mock-utils';
import { LOAN_STATUSES, REPAYMENT_STATUSES } from '@/lib/constants/application-statuses';
import { PAGINATION_DEFAULTS } from '@/lib/constants/pagination';
import { APP_ROUTES } from '@/lib/constants/routes';
import { ConflictError, NotFoundError, ValidationError } from '@/lib/errors/app-error';
import type { RecordScope } from '@/types/api';
import type {
  PaginatedRepaymentsResponse,
  RecordRepaymentDTO,
  Repayment,
  RepaymentQueryParams,
  RepaymentsMetricsSummary,
} from '@/types/repayment';

export function handleRepaymentsList(
  params: Record<string, string | number | boolean | undefined>,
): Repayment[] {
  const institutionId = String(params.institutionId || '');
  const search = params.search ? String(params.search) : undefined;
  const customerId = params.customerId ? String(params.customerId) : undefined;
  return queryRepayments({ institutionId, search, customerId }).filtered;
}

export function handleRepaymentsPaginated(
  params: Record<string, string | number | boolean | undefined>,
): PaginatedRepaymentsResponse {
  const institutionId = String(params.institutionId || '');
  const customerId = params.customerId ? String(params.customerId) : undefined;
  const loanId = params.loanId ? String(params.loanId) : undefined;
  const search = params.search ? String(params.search) : undefined;
  const page = params.page ? Number(params.page) : undefined;
  const pageSize = params.pageSize ? Number(params.pageSize) : undefined;

  const { filtered, summary } = queryRepayments({
    institutionId,
    customerId,
    loanId,
    search,
    page,
    pageSize,
  });
  const paginated = paginate(
    filtered,
    page ?? PAGINATION_DEFAULTS.INITIAL_PAGE,
    pageSize ?? PAGINATION_DEFAULTS.PAGE_SIZE,
  );
  return { ...paginated, summary };
}

export function handleRepaymentGetById(
  id: string,
  params: Record<string, string | number | boolean | undefined>,
): Repayment {
  const scope: RecordScope = {
    institutionId: params.institutionId ? String(params.institutionId) : '',
    customerId: params.customerId ? String(params.customerId) : undefined,
  };
  const db = MockStorageAdapter.getInstance().getDatabase();
  const record = db.repayments.find((r) => r.id === id);
  if (!record || !matchesScope(record, scope)) {
    throw new NotFoundError(`Repayment ${id}`);
  }
  return record;
}

export function handleRepaymentRecord(dto: RecordRepaymentDTO): Repayment {
  if (!Number.isFinite(dto.amount) || dto.amount <= 0) {
    throw new ValidationError('Payment amount must be greater than zero.');
  }

  let createdRepayment: Repayment | undefined;

  MockStorageAdapter.getInstance().updateDatabase((db) => {
    const loan = db.loans.find((l) => l.id === dto.loanId);
    if (!loan) {
      throw new NotFoundError(`Loan ${dto.loanId}`);
    }

    if (loan.institutionId !== dto.institutionId) {
      throw new ValidationError(`Loan ${dto.loanId} does not belong to this institution.`);
    }

    if (loan.customerId !== dto.customerId) {
      throw new ValidationError(`Loan ${dto.loanId} does not belong to the specified customer.`);
    }

    const remaining = Math.max(0, loan.totalDue - loan.paid);
    if (loan.status === LOAN_STATUSES.COMPLETED || remaining <= 0) {
      throw new ConflictError(`Loan ${dto.loanId} is already settled.`);
    }

    if (dto.amount > remaining) {
      throw new ValidationError(`Payment amount exceeds the remaining balance of ${remaining}.`);
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
      date: new Date().toISOString(),
      status: REPAYMENT_STATUSES.PAID,
    };

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
    throw new NotFoundError('Failed to record repayment');
  }
  return createdRepayment;
}

function queryRepayments(params: RepaymentQueryParams): {
  filtered: Repayment[];
  summary: RepaymentsMetricsSummary;
} {
  const db = MockStorageAdapter.getInstance().getDatabase();
  let scopedRecords = db.repayments.filter((r) => r.institutionId === params.institutionId);
  let scopedLoans = db.loans.filter((l) => l.institutionId === params.institutionId);

  if (params.customerId) {
    scopedRecords = scopedRecords.filter((r) => r.customerId === params.customerId);
    scopedLoans = scopedLoans.filter((l) => l.customerId === params.customerId);
  }

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
  const activeFacilitiesCount = scopedLoans.filter((l) => l.status === LOAN_STATUSES.ACTIVE).length;

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
