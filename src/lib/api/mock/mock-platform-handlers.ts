import { MockStorageAdapter } from '../mock-store';
import { matchesScope, paginate } from './mock-utils';
import { APPLICATION_STATUSES, LOAN_STATUSES } from '@/lib/constants/application-statuses';
import { PAGINATION_DEFAULTS } from '@/lib/constants/pagination';
import { APP_ROUTE_BUILDERS } from '@/lib/constants/routes';
import { STORAGE_KEYS } from '@/lib/constants/storage-keys';
import { NotFoundError, ValidationError } from '@/lib/errors/app-error';
import type { RecordScope } from '@/types/api';
import type { LoginCredentials, UserSession } from '@/types/auth';
import type {
  LenderDashboardMetrics,
  CustomerDashboardMetrics,
  LenderActivityFeedResponse,
  LenderActivityItem,
  LenderActivityCategory,
} from '@/types/dashboard';
import type { Institution, InstitutionSettingsUpdate } from '@/types/institution';
import type { AppNotification } from '@/types/notification';
import type {
  Customer,
  CustomerDetailView,
  CustomerDirectoryFilter,
  CustomerWithStats,
  PaginatedCustomersResponse,
} from '@/types/customer';

export function handleAuthLogin(credentials: LoginCredentials): UserSession {
  const { email, password, institutionId, role } = credentials;
  if (!email || !password || password.length < 5) {
    throw new ValidationError('Valid email and password (minimum 5 characters) are required.');
  }

  const db = MockStorageAdapter.getInstance().getDatabase();
  const institution = db.institutions.find((b) => b.id === institutionId);
  if (!institution) {
    throw new NotFoundError('Institution');
  }

  let customerId: string | undefined;
  let business: string | undefined;
  let userName = 'Alex Okafor';
  const normalizedEmail = email.trim().toLowerCase();

  if (role === 'customer') {
    const scopedCustomers = db.customers.filter((c) => c.institutionId === institutionId);
    const customer =
      scopedCustomers.find((c) => c.email.toLowerCase() === normalizedEmail) ?? scopedCustomers[0];
    if (customer) {
      userName = customer.name;
      customerId = customer.id;
      business = customer.business;
    } else {
      userName = 'Demo Customer';
    }
  }

  const session: UserSession = {
    id: role === 'lender' ? 'usr-lender-1' : (customerId ?? 'usr-customer-1'),
    name: userName,
    email: email.trim(),
    role,
    institutionId,
    customerId,
    business,
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.USER_SESSION, JSON.stringify(session));
    localStorage.setItem(STORAGE_KEYS.CURRENT_INSTITUTION, institutionId);
  }

  return session;
}

export function handleAuthSession(): UserSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_SESSION);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function handleAuthLogout(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEYS.USER_SESSION);
  }
}

export function handleInstitutionsGetAll(): Institution[] {
  return MockStorageAdapter.getInstance().getDatabase().institutions;
}

export function handleInstitutionGetById(id: string): Institution {
  const db = MockStorageAdapter.getInstance().getDatabase();
  const inst = db.institutions.find((b) => b.id === id);
  if (!inst) {
    throw new NotFoundError(`Institution ${id}`);
  }
  return inst;
}

export function handleInstitutionUpdateSettings(
  id: string,
  updates: InstitutionSettingsUpdate,
): Institution {
  let updatedInstitution: Institution | undefined;

  MockStorageAdapter.getInstance().updateDatabase((db) => {
    const idx = db.institutions.findIndex((b) => b.id === id);
    if (idx === -1) {
      throw new NotFoundError(`Institution ${id}`);
    }
    const existing = db.institutions[idx];
    const merged: Institution = {
      ...existing,
      ...updates,
    };
    db.institutions[idx] = merged;
    updatedInstitution = merged;
    return db;
  });

  if (!updatedInstitution) {
    throw new NotFoundError(`Institution ${id}`);
  }
  return updatedInstitution;
}

export function handleCustomersList(
  params: Record<string, string | number | boolean | undefined>,
): Customer[] {
  const institutionId = String(params.institutionId || '');
  const search = params.search ? String(params.search) : undefined;
  const db = MockStorageAdapter.getInstance().getDatabase();
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

export function handleCustomersPaginated(
  params: Record<string, string | number | boolean | undefined>,
): PaginatedCustomersResponse {
  const institutionId = String(params.institutionId || '');
  const filter = params.filter as CustomerDirectoryFilter | undefined;
  const search = params.search ? String(params.search) : undefined;
  const page = params.page ? Number(params.page) : undefined;
  const pageSize = params.pageSize ? Number(params.pageSize) : undefined;

  const db = MockStorageAdapter.getInstance().getDatabase();
  const scopedCustomers = db.customers.filter((c) => c.institutionId === institutionId);
  const scopedLoans = db.loans.filter((l) => l.institutionId === institutionId);

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

  let filtered: CustomerWithStats[] = scopedCustomers.map((c) => ({
    ...c,
    fundedLoansCount: loanCountByCustomer.get(c.id) ?? 0,
  }));

  if (filter === 'ACTIVE') {
    filtered = filtered.filter((c) => activeCustomerIds.has(c.id));
  } else if (filter === 'HIGH_SCORE') {
    filtered = filtered.filter((c) => c.score >= 750);
  }

  if (search && search.trim()) {
    const q = search.toLowerCase().trim();
    filtered = filtered.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.business.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        (c.location?.toLowerCase().includes(q) ?? false),
    );
  }

  const paginated = paginate(
    filtered,
    page ?? PAGINATION_DEFAULTS.INITIAL_PAGE,
    pageSize ?? PAGINATION_DEFAULTS.PAGE_SIZE,
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

export function handleCustomerGetById(
  id: string,
  params: Record<string, string | number | boolean | undefined>,
): CustomerDetailView {
  const scope: Pick<RecordScope, 'institutionId'> = {
    institutionId: params.institutionId ? String(params.institutionId) : '',
  };
  const db = MockStorageAdapter.getInstance().getDatabase();
  const customer = db.customers.find((c) => c.id === id);
  if (!customer || !matchesScope(customer, scope)) {
    throw new NotFoundError(`Customer ${id}`);
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

export function handleDashboardLenderMetrics(
  params: Record<string, string | number | boolean | undefined>,
): LenderDashboardMetrics {
  const institutionId = String(params.institutionId || '');
  const db = MockStorageAdapter.getInstance().getDatabase();
  const apps = db.applications.filter((a) => a.institutionId === institutionId);
  const loans = db.loans.filter((l) => l.institutionId === institutionId);
  const repayments = db.repayments.filter((r) => r.institutionId === institutionId);

  const pendingReviewCount = apps.filter(
    (a) => a.status === APPLICATION_STATUSES.PENDING || a.status === APPLICATION_STATUSES.IN_REVIEW,
  ).length;

  const activeLoans = loans.filter((l) => l.status === LOAN_STATUSES.ACTIVE);
  const totalDisbursed = loans.reduce((sum, l) => sum + l.principal, 0);
  const outstandingBalance = loans.reduce((sum, l) => sum + Math.max(0, l.totalDue - l.paid), 0);
  const totalCollected = repayments.reduce((sum, r) => sum + r.amount, 0);

  const totalLoans = loans.length || 1;
  const portfolioActivePercentage = Math.round((activeLoans.length / totalLoans) * 100);
  const portfolioRepaidPercentage = 100 - portfolioActivePercentage;

  return {
    totalDisbursed,
    activeLoansCount: activeLoans.length,
    pendingReviewCount,
    totalCollected,
    recordedRepaymentsCount: repayments.length,
    outstandingBalance,
    fundedLoansCount: loans.length,
    portfolioActivePercentage,
    portfolioRepaidPercentage,
  };
}

export function handleDashboardCustomerMetrics(
  params: Record<string, string | number | boolean | undefined>,
): CustomerDashboardMetrics {
  const institutionId = String(params.institutionId || '');
  const customerId = String(params.customerId || '');
  const db = MockStorageAdapter.getInstance().getDatabase();
  const loans = db.loans.filter(
    (l) => l.institutionId === institutionId && l.customerId === customerId,
  );

  const activeLoans = loans.filter((l) => l.status === LOAN_STATUSES.ACTIVE);
  const totalBorrowed = loans.reduce((sum, l) => sum + l.principal, 0);
  const totalRepaid = loans.reduce((sum, l) => sum + l.paid, 0);
  const outstandingBalance = loans.reduce((sum, l) => sum + Math.max(0, l.totalDue - l.paid), 0);

  const nextLoan = activeLoans.sort((a, b) => a.due.localeCompare(b.due))[0];
  const nextPaymentDue = nextLoan
    ? {
        loanId: nextLoan.id,
        amount: Math.round(nextLoan.totalDue / nextLoan.term),
        dueDate: nextLoan.due,
        progressPercentage: Math.min(100, Math.round((nextLoan.paid / nextLoan.totalDue) * 100)),
      }
    : undefined;

  return {
    activeLoansCount: activeLoans.length,
    totalBorrowed,
    totalRepaid,
    outstandingBalance,
    nextPaymentDue,
  };
}

export function handleDashboardActivities(
  params: Record<string, string | number | boolean | undefined>,
): LenderActivityFeedResponse {
  const institutionId = String(params.institutionId || '');
  const limit = params.limit ? Number(params.limit) : undefined;
  const category = (params.category ? String(params.category) : 'all') as LenderActivityCategory;

  const db = MockStorageAdapter.getInstance().getDatabase();
  const apps = db.applications.filter((a) => a.institutionId === institutionId);
  const loans = db.loans.filter((l) => l.institutionId === institutionId);
  const repayments = db.repayments.filter((r) => r.institutionId === institutionId);

  const items: LenderActivityItem[] = [];

  for (const repayment of repayments) {
    items.push({
      id: `repayment-${repayment.id}`,
      referenceId: repayment.id,
      category: 'repayment',
      title: 'Repayment received',
      business: repayment.business,
      amount: repayment.amount,
      date: repayment.date,
      status: repayment.status,
      href: APP_ROUTE_BUILDERS.LENDER.REPAYMENT(repayment.id),
    });
  }

  for (const loan of loans) {
    items.push({
      id: `loan-${loan.id}`,
      referenceId: loan.id,
      category: 'loan',
      title: loan.status === LOAN_STATUSES.COMPLETED ? 'Facility settled' : 'Facility disbursed',
      business: loan.business,
      amount: loan.principal,
      date: loan.issued,
      status: loan.status,
      href: APP_ROUTE_BUILDERS.LENDER.LOAN(loan.id),
    });
  }

  for (const app of apps) {
    const title =
      app.status === APPLICATION_STATUSES.APPROVED
        ? 'Application approved'
        : app.status === APPLICATION_STATUSES.DECLINED
          ? 'Application declined'
          : app.status === APPLICATION_STATUSES.IN_REVIEW
            ? 'Marked in review'
            : 'Credit request submitted';

    items.push({
      id: `application-${app.id}`,
      referenceId: app.id,
      category: 'application',
      title,
      business: app.business,
      amount: app.amount,
      date: app.submitted,
      status: app.status,
      href: APP_ROUTE_BUILDERS.LENDER.APPLICATION(app.id),
    });
  }

  items.sort((a, b) => b.date.localeCompare(a.date));

  const filtered = category === 'all' ? items : items.filter((item) => item.category === category);
  const sliced = typeof limit === 'number' ? filtered.slice(0, limit) : filtered;

  return {
    items: sliced,
    totalCount: items.length,
  };
}

export function handleNotificationsList(
  params: Record<string, string | number | boolean | undefined>,
): AppNotification[] {
  const institutionId = String(params.institutionId || '');
  const db = MockStorageAdapter.getInstance().getDatabase();
  const reads = db.notificationReads || {};

  return db.notifications
    .filter((n) => n.institutionId === institutionId)
    .map((n) => ({
      ...n,
      read: Boolean(reads[n.id] ?? n.read),
    }))
    .sort((left, right) => Number(left.read) - Number(right.read));
}

export function handleNotificationMarkRead(notificationId: string): void {
  MockStorageAdapter.getInstance().updateDatabase((db) => {
    db.notificationReads = db.notificationReads || {};
    db.notificationReads[notificationId] = true;
    return db;
  });
}

export function handleNotificationsMarkAllRead(body: { institutionId: string }): void {
  MockStorageAdapter.getInstance().updateDatabase((db) => {
    db.notificationReads = db.notificationReads || {};
    db.notifications
      .filter((n) => n.institutionId === body.institutionId)
      .forEach((n) => {
        db.notificationReads[n.id] = true;
      });
    return db;
  });
}
