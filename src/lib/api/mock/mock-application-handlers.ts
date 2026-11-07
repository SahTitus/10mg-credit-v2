import { MockStorageAdapter } from '../mock-store';
import { matchesScope, paginate } from './mock-utils';
import { APPLICATION_STATUSES, LOAN_STATUSES } from '@/lib/constants/application-statuses';
import { PAGINATION_DEFAULTS } from '@/lib/constants/pagination';
import { APP_ROUTES } from '@/lib/constants/routes';
import { ConflictError, NotFoundError, ValidationError } from '@/lib/errors/app-error';
import type { RecordScope } from '@/types/api';
import type {
  ApplicationQueryParams,
  ApplicationsMetricsSummary,
  ApplicationStatus,
  CreateApplicationDTO,
  LoanApplication,
  PaginatedApplicationsResponse,
} from '@/types/application';
import type { Customer } from '@/types/customer';
import type { Loan } from '@/types/loan';

export function handleApplicationsList(
  params: Record<string, string | number | boolean | undefined>,
): LoanApplication[] {
  const institutionId = String(params.institutionId || '');
  const status = params.status ? String(params.status) : undefined;
  const search = params.search ? String(params.search) : undefined;
  const customerId = params.customerId ? String(params.customerId) : undefined;
  return queryApplications({ institutionId, status, search, customerId }).filtered;
}

export function handleApplicationsPaginated(
  params: Record<string, string | number | boolean | undefined>,
): PaginatedApplicationsResponse {
  const institutionId = String(params.institutionId || '');
  const status = params.status ? String(params.status) : undefined;
  const search = params.search ? String(params.search) : undefined;
  const customerId = params.customerId ? String(params.customerId) : undefined;
  const page = params.page ? Number(params.page) : undefined;
  const pageSize = params.pageSize ? Number(params.pageSize) : undefined;

  const { filtered, summary } = queryApplications({
    institutionId,
    status,
    search,
    customerId,
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

export function handleApplicationsPendingCount(
  params: Record<string, string | number | boolean | undefined>,
): number {
  const institutionId = String(params.institutionId || '');
  const db = MockStorageAdapter.getInstance().getDatabase();
  return db.applications.filter(
    (a) =>
      a.institutionId === institutionId &&
      (a.status === APPLICATION_STATUSES.PENDING || a.status === APPLICATION_STATUSES.IN_REVIEW),
  ).length;
}

export function handleApplicationGetById(
  id: string,
  params: Record<string, string | number | boolean | undefined>,
): LoanApplication {
  const scope: RecordScope = {
    institutionId: params.institutionId ? String(params.institutionId) : '',
    customerId: params.customerId ? String(params.customerId) : undefined,
  };
  const db = MockStorageAdapter.getInstance().getDatabase();
  const app = db.applications.find((a) => a.id === id);
  if (!app || !matchesScope(app, scope)) {
    throw new NotFoundError(`Application ${id}`);
  }
  const customer = db.customers.find(
    (c) => c.id === app.customerId && c.institutionId === app.institutionId,
  );
  return {
    ...app,
    email: app.email || customer?.email,
    phone: app.phone || customer?.phone,
    location: app.location || customer?.location,
  };
}

export function handleApplicationCreate(dto: CreateApplicationDTO): LoanApplication {
  if (!Number.isFinite(dto.amount) || dto.amount <= 0) {
    throw new ValidationError('Application amount must be greater than zero.');
  }

  let createdApp: LoanApplication | undefined;

  MockStorageAdapter.getInstance().updateDatabase((data) => {
    const institution = data.institutions.find((b) => b.id === dto.institutionId);
    if (!institution) {
      throw new NotFoundError('Institution');
    }

    const scopedCustomers = data.customers.filter((c) => c.institutionId === dto.institutionId);
    const email = dto.email?.trim() || undefined;
    const phone = dto.phone?.trim() || undefined;
    const location = dto.location?.trim() || undefined;

    let resolvedCustomer: Customer | undefined;
    if (dto.customerId) {
      resolvedCustomer = scopedCustomers.find((c) => c.id === dto.customerId);
      if (!resolvedCustomer) {
        throw new ValidationError(
          `Customer ${dto.customerId} does not belong to this institution.`,
        );
      }
    } else {
      const normalizedEmail = email?.toLowerCase();
      const normalizedBusiness = dto.business.trim().toLowerCase();
      const normalizedName = dto.name.trim().toLowerCase();

      resolvedCustomer =
        (normalizedEmail
          ? scopedCustomers.find(
              (c) => Boolean(c.email) && c.email.toLowerCase() === normalizedEmail,
            )
          : undefined) ??
        scopedCustomers.find(
          (c) =>
            c.business.toLowerCase() === normalizedBusiness &&
            c.name.toLowerCase() === normalizedName,
        );
    }

    const applicantName = dto.name.trim() || resolvedCustomer?.name || '';
    const businessName = dto.business.trim() || resolvedCustomer?.business || '';

    if (!applicantName || !businessName) {
      throw new ValidationError('Applicant name and business name are required.');
    }

    const today = new Date().toISOString().slice(0, 10);

    if (!resolvedCustomer) {
      const nextCustomerSeq =
        scopedCustomers.reduce((max, c) => {
          const match = c.id.match(/-cus-(\d+)$/);
          return match ? Math.max(max, Number(match[1])) : max;
        }, scopedCustomers.length) + 1;

      resolvedCustomer = {
        id: `${dto.institutionId}-cus-${nextCustomerSeq}`,
        institutionId: dto.institutionId,
        name: applicantName,
        business: businessName,
        email: email ?? '',
        phone: phone ?? '',
        location,
        joined: today,
        score: 710,
      };
      data.customers.unshift(resolvedCustomer);
    }

    const prefix = dto.institutionId === 'bluehaven' ? 'BH' : 'MR';
    const maxAppSeq = data.applications.reduce((max, a) => {
      const match = a.id.match(/-(\d+)$/);
      return match ? Math.max(max, Number(match[1])) : max;
    }, 1050);
    const id = `${prefix}-26-${String(maxAppSeq + 1)}`;

    const newApp: LoanApplication = {
      id,
      institutionId: dto.institutionId,
      customerId: resolvedCustomer.id,
      name: applicantName,
      business: businessName,
      email: email || resolvedCustomer.email || undefined,
      phone: phone || resolvedCustomer.phone || undefined,
      location: location || resolvedCustomer.location || undefined,
      amount: dto.amount,
      purpose: dto.purpose,
      term: dto.term,
      status: APPLICATION_STATUSES.PENDING,
      submitted: today,
      note: dto.notes,
    };

    data.applications.unshift(newApp);
    createdApp = newApp;

    data.notifications.unshift({
      id: `notif-${Date.now()}`,
      institutionId: dto.institutionId,
      title: 'New credit request',
      message: `${businessName} submitted application #${id}`,
      time: 'Just now',
      read: false,
      category: 'application',
      targetRoute: APP_ROUTES.LENDER.APPLICATIONS,
      targetId: id,
    });
    return data;
  });

  if (!createdApp) {
    throw new NotFoundError('Application');
  }

  return createdApp;
}

export function handleApplicationUpdateStatus(
  id: string,
  body: { status: ApplicationStatus; note?: string },
): LoanApplication {
  let updatedApp: LoanApplication | undefined;

  MockStorageAdapter.getInstance().updateDatabase((db) => {
    const idx = db.applications.findIndex((a) => a.id === id);
    if (idx === -1) {
      throw new NotFoundError(`Application ${id}`);
    }

    const existing = db.applications[idx];
    existing.status = body.status;
    if (body.note !== undefined) existing.note = body.note;
    updatedApp = existing;

    if (body.status === APPLICATION_STATUSES.APPROVED) {
      const hasLoan = db.loans.some((l) => l.applicationId === id);
      if (!hasLoan) {
        const bank = db.institutions.find((b) => b.id === existing.institutionId);
        const interestRate = bank?.interest ?? 9.5;
        const totalDue = Math.round(
          existing.amount * (1 + (interestRate * (existing.term / 12)) / 100),
        );
        const loanPrefix = existing.institutionId === 'bluehaven' ? 'BL' : 'ML';
        const maxLoanSeq = db.loans.reduce((max, l) => {
          const match = l.id.match(/-(\d+)$/);
          return match ? Math.max(max, Number(match[1])) : max;
        }, 6037);
        const loanId = `${loanPrefix}-26-${String(maxLoanSeq + 1)}`;

        const newLoan: Loan = {
          id: loanId,
          applicationId: existing.id,
          institutionId: existing.institutionId,
          customerId: existing.customerId,
          borrower: existing.name,
          business: existing.business,
          principal: existing.amount,
          totalDue,
          paid: 0,
          term: existing.term,
          issued: new Date().toISOString().slice(0, 10),
          due: new Date(Date.now() + existing.term * 30 * 86400000).toISOString().slice(0, 10),
          status: LOAN_STATUSES.ACTIVE,
        };
        db.loans.unshift(newLoan);
      }
    }

    return db;
  });

  if (!updatedApp) {
    throw new NotFoundError(`Application ${id}`);
  }
  return updatedApp;
}

export function handleApplicationWithdraw(
  id: string,
  params: Record<string, string | number | boolean | undefined>,
): void {
  const scope: RecordScope = {
    institutionId: params.institutionId ? String(params.institutionId) : '',
    customerId: params.customerId ? String(params.customerId) : undefined,
  };

  MockStorageAdapter.getInstance().updateDatabase((db) => {
    const idx = db.applications.findIndex((a) => a.id === id);
    if (idx === -1) {
      throw new NotFoundError(`Application ${id}`);
    }
    const existing = db.applications[idx];
    if (!matchesScope(existing, scope)) {
      throw new NotFoundError(`Application ${id}`);
    }
    if (existing.status !== APPLICATION_STATUSES.PENDING) {
      throw new ConflictError('Only pending applications not yet in review can be withdrawn.');
    }
    db.applications.splice(idx, 1);
    return db;
  });
}

function queryApplications(params: ApplicationQueryParams): {
  filtered: LoanApplication[];
  summary: ApplicationsMetricsSummary;
} {
  const db = MockStorageAdapter.getInstance().getDatabase();
  const customerMap = new Map(db.customers.map((c) => [c.id, c]));
  let scoped = db.applications
    .filter((a) => a.institutionId === params.institutionId)
    .map((a) => {
      const customer = customerMap.get(a.customerId);
      return {
        ...a,
        email: a.email || customer?.email,
        phone: a.phone || customer?.phone,
        location: a.location || customer?.location,
      };
    });
  if (params.customerId) {
    scoped = scoped.filter((a) => a.customerId === params.customerId);
  }

  const pendingApps = scoped.filter(
    (a) => a.status === APPLICATION_STATUSES.PENDING || a.status === APPLICATION_STATUSES.IN_REVIEW,
  );
  const approvedApps = scoped.filter((a) => a.status === APPLICATION_STATUSES.APPROVED);
  const declinedApps = scoped.filter((a) => a.status === APPLICATION_STATUSES.DECLINED);
  const pendingValue = pendingApps.reduce((sum, a) => sum + a.amount, 0);
  const approvedValue = approvedApps.reduce((sum, a) => sum + a.amount, 0);
  const requestedVolume = scoped.reduce((sum, a) => sum + a.amount, 0);
  const approvalRate = scoped.length ? Math.round((approvedApps.length / scoped.length) * 100) : 0;

  let filtered = [...scoped];
  if (params.status && params.status !== 'All') {
    filtered = filtered.filter((a) => a.status === params.status);
  }

  if (params.search && params.search.trim()) {
    const q = params.search.toLowerCase().trim();
    filtered = filtered.filter(
      (a) =>
        a.id.toLowerCase().includes(q) ||
        a.name.toLowerCase().includes(q) ||
        a.business.toLowerCase().includes(q) ||
        a.purpose.toLowerCase().includes(q) ||
        (a.email?.toLowerCase().includes(q) ?? false) ||
        (a.phone?.toLowerCase().includes(q) ?? false) ||
        (a.location?.toLowerCase().includes(q) ?? false),
    );
  }

  filtered.sort((a, b) => b.submitted.localeCompare(a.submitted));

  return {
    filtered,
    summary: {
      totalCount: scoped.length,
      pendingCount: pendingApps.length,
      pendingValue,
      approvedCount: approvedApps.length,
      approvedValue,
      declinedCount: declinedApps.length,
      approvalRate,
      requestedVolume,
    },
  };
}
