import { MockStorageAdapter } from '../mock-store';
import { matchesScope, paginate } from './mock-utils';
import { LOAN_STATUSES } from '@/lib/constants/application-statuses';
import { PAGINATION_DEFAULTS } from '@/lib/constants/pagination';
import { NotFoundError } from '@/lib/errors/app-error';
import type { RecordScope } from '@/types/api';
import type {
  Loan,
  LoanQueryParams,
  LoansMetricsSummary,
  PaginatedLoansResponse,
} from '@/types/loan';
import type { Repayment } from '@/types/repayment';

export function handleLoansList(
  params: Record<string, string | number | boolean | undefined>,
): Loan[] {
  const institutionId = String(params.institutionId || '');
  const customerId = params.customerId ? String(params.customerId) : undefined;
  const search = params.search ? String(params.search) : undefined;
  return queryLoans({ institutionId, customerId, search }).filtered;
}

export function handleLoansPaginated(
  params: Record<string, string | number | boolean | undefined>,
): PaginatedLoansResponse {
  const institutionId = String(params.institutionId || '');
  const customerId = params.customerId ? String(params.customerId) : undefined;
  const status = params.status ? String(params.status) : undefined;
  const search = params.search ? String(params.search) : undefined;
  const page = params.page ? Number(params.page) : undefined;
  const pageSize = params.pageSize ? Number(params.pageSize) : undefined;

  const { filtered, summary } = queryLoans({
    institutionId,
    customerId,
    status,
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

export function handleLoanGetById(
  id: string,
  params: Record<string, string | number | boolean | undefined>,
): Loan {
  const scope: RecordScope = {
    institutionId: params.institutionId ? String(params.institutionId) : '',
    customerId: params.customerId ? String(params.customerId) : undefined,
  };
  const db = MockStorageAdapter.getInstance().getDatabase();
  const loan = db.loans.find((l) => l.id === id);
  if (!loan || !matchesScope(loan, scope)) {
    throw new NotFoundError(`Loan ${id}`);
  }
  return loan;
}

export function handleLoanGetRepayments(
  loanId: string,
  params: Record<string, string | number | boolean | undefined>,
): Repayment[] {
  const scope: RecordScope = {
    institutionId: params.institutionId ? String(params.institutionId) : '',
    customerId: params.customerId ? String(params.customerId) : undefined,
  };
  const db = MockStorageAdapter.getInstance().getDatabase();
  const loan = db.loans.find((l) => l.id === loanId);
  if (!loan || !matchesScope(loan, scope)) {
    throw new NotFoundError(`Loan ${loanId}`);
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

function queryLoans(params: LoanQueryParams): {
  filtered: Loan[];
  summary: LoansMetricsSummary;
} {
  const db = MockStorageAdapter.getInstance().getDatabase();
  let scoped = db.loans.filter((l) => l.institutionId === params.institutionId);

  if (params.customerId) {
    scoped = scoped.filter((l) => l.customerId === params.customerId);
  }

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
