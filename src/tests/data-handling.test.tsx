import * as React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WorkspaceShell } from '@/components/layout/workspace-shell';
import { ToastProvider } from '@/components/primitives/toast';
import { useCustomerLoanDetail } from '@/features/loans/hooks/use-customer-loan-detail';
import { ApiClient, globalApiClient } from '@/lib/api/api-client';
import { ApplicationApiService, applicationApiService } from '@/lib/api/application-service';
import { customerApiService } from '@/lib/api/customer-service';
import { loanApiService } from '@/lib/api/loan-service';
import { MockStorageAdapter } from '@/lib/api/mock-store';
import { repaymentApiService } from '@/lib/api/repayment-service';
import { API_ENV } from '@/lib/config/env';
import { API_ENDPOINTS } from '@/lib/constants/api-endpoints';
import { APPLICATION_STATUSES } from '@/lib/constants/application-statuses';
import { DEFAULT_INSTITUTIONS } from '@/lib/constants/institutions';
import { QUERY_KEYS } from '@/lib/constants/query-keys';
import { AppError, NotFoundError } from '@/lib/errors/app-error';
import { isNotFoundError } from '@/lib/errors/error-handler';
import { keepScopedPreviousData, shouldRetryDetailQuery } from '@/lib/utils/query-helpers';
import {
  invalidateAfterApplicationCreated,
  invalidateAfterApplicationDecision,
  invalidateAfterApplicationWithdrawn,
  invalidateAfterRepayment,
} from '@/lib/utils/query-invalidation';
import { useAuthStore } from '@/store/auth-store';
import { useInstitutionStore } from '@/store/institution-store';

const navigationState = {
  pathname: '/customer/overview',
  params: { id: 'BH-LN-101' } as Record<string, string>,
};

vi.mock('next/navigation', () => ({
  usePathname: () => navigationState.pathname,
  useParams: () => navigationState.params,
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 3,
        refetchOnWindowFocus: false,
        retry: false,
        retryDelay: 0,
      },
    },
  });
}

function createWrapper(queryClient: QueryClient) {
  return function TestWrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <ToastProvider>{children}</ToastProvider>
      </QueryClientProvider>
    );
  };
}

describe('Multi-Tenant Query Isolation, Invalidation, Error Handling & Scope Guards', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    MockStorageAdapter.getInstance().resetToDefaults();
    useInstitutionStore.setState({
      currentInstitution: DEFAULT_INSTITUTIONS[0],
      institutions: [...DEFAULT_INSTITUTIONS],
      isHydrated: true,
    });
    useAuthStore.setState({
      session: {
        id: 'usr-1',
        name: 'Amina Yusuf',
        email: 'ayusuf@aminapharmacy.ng',
        role: 'customer',
        institutionId: 'bluehaven',
        customerId: 'bluehaven-cus-1',
        business: 'Amina Pharmacy',
      },
      isLoading: false,
      isSigningOut: false,
    });
    navigationState.pathname = '/customer/overview';
    navigationState.params = { id: 'BH-LN-101' };
  });

  describe('keepScopedPreviousData', () => {
    it('retains previous data across intra-tenant pagination and filters, and clears on tenant or customer switch', () => {
      const sampleRows = { items: ['row-1'], totalCount: 1 };
      const previousLoanQuery = {
        queryKey: QUERY_KEYS.LOANS_PAGINATED('bluehaven', 'bluehaven-cus-1', 'All', '', 1),
      };

      const sameScopeSelector = keepScopedPreviousData('bluehaven', 'bluehaven-cus-1', 3);
      expect(sameScopeSelector(sampleRows, previousLoanQuery)).toBe(sampleRows);

      const switchedTenantSelector = keepScopedPreviousData('meridian', 'meridian-cus-1', 3);
      expect(switchedTenantSelector(sampleRows, previousLoanQuery)).toBeUndefined();

      const switchedCustomerSelector = keepScopedPreviousData('bluehaven', 'bluehaven-cus-2', 3);
      expect(switchedCustomerSelector(sampleRows, previousLoanQuery)).toBeUndefined();
    });

    it('clears placeholder data on customer switch for applications and repayments paginated keys', () => {
      const samplePage = { items: ['item-1'], totalCount: 1 };
      const previousAppQuery = {
        queryKey: QUERY_KEYS.APPLICATIONS_PAGINATED('bluehaven', 'All', '', 1, 'bluehaven-cus-1'),
      };

      expect(
        keepScopedPreviousData('bluehaven', 'bluehaven-cus-1', 6)(samplePage, previousAppQuery),
      ).toBe(samplePage);
      expect(
        keepScopedPreviousData('bluehaven', 'bluehaven-cus-2', 6)(samplePage, previousAppQuery),
      ).toBeUndefined();
    });
  });

  describe('Centralized mutation cache invalidation', () => {
    it('invalidates loan detail, repayment history, notifications, activities, and customer caches on payment without touching other tenants', () => {
      const queryClient = createTestQueryClient();

      const bluehavenKeys = [
        QUERY_KEYS.LOAN_DETAIL('BH-LN-101', 'bluehaven', 'bluehaven-cus-1'),
        QUERY_KEYS.LOAN_DETAIL('BH-LN-101', 'bluehaven'),
        QUERY_KEYS.LOAN_REPAYMENTS('BH-LN-101', 'bluehaven', 'bluehaven-cus-1'),
        QUERY_KEYS.LOAN_REPAYMENTS('BH-LN-101', 'bluehaven'),
        QUERY_KEYS.REPAYMENT_DETAIL('BH-PAY-901', 'bluehaven', 'bluehaven-cus-1'),
        QUERY_KEYS.REPAYMENTS_PAGINATED('bluehaven', 'ALL', '', 1, 'bluehaven-cus-1'),
        QUERY_KEYS.LOANS_PAGINATED('bluehaven', 'bluehaven-cus-1', 'All', '', 1),
        QUERY_KEYS.DASHBOARD_METRICS('bluehaven', 'lender'),
        QUERY_KEYS.LENDER_RECENT_ACTIVITIES('bluehaven', 5),
        QUERY_KEYS.LENDER_ALL_ACTIVITIES('bluehaven', 'all'),
        QUERY_KEYS.NOTIFICATIONS('bluehaven'),
        QUERY_KEYS.CUSTOMERS_PAGINATED('bluehaven', 'ALL', '', 1),
        QUERY_KEYS.CUSTOMER_DETAIL('bluehaven-cus-1', 'bluehaven'),
      ];

      const meridianKeys = [
        QUERY_KEYS.LOANS_PAGINATED('meridian', undefined, 'ALL', '', 1),
        QUERY_KEYS.REPAYMENTS_PAGINATED('meridian', 'ALL', '', 1),
        QUERY_KEYS.LENDER_RECENT_ACTIVITIES('meridian', 5),
        QUERY_KEYS.NOTIFICATIONS('meridian'),
      ];

      for (const key of [...bluehavenKeys, ...meridianKeys]) {
        queryClient.setQueryData(key, { seeded: true });
      }

      invalidateAfterRepayment(queryClient, {
        institutionId: 'bluehaven',
        loanId: 'BH-LN-101',
        repaymentId: 'BH-PAY-901',
        customerId: 'bluehaven-cus-1',
      });

      for (const key of bluehavenKeys) {
        expect(queryClient.getQueryState(key)?.isInvalidated).toBe(true);
      }

      for (const key of meridianKeys) {
        expect(queryClient.getQueryState(key)?.isInvalidated).toBe(false);
      }
    });

    it('invalidates pending count, activities, loans, and detail views across application lifecycle mutations', () => {
      const queryClient = createTestQueryClient();
      const pendingCountKey = QUERY_KEYS.APPLICATIONS_PENDING_COUNT('bluehaven');
      const appDetailKey = QUERY_KEYS.APPLICATION_DETAIL(
        'BH-APP-301',
        'bluehaven',
        'bluehaven-cus-1',
      );
      const loansKey = QUERY_KEYS.LOANS('bluehaven', 'bluehaven-cus-1');
      const recentActivityKey = QUERY_KEYS.LENDER_RECENT_ACTIVITIES('bluehaven', 5);

      for (const key of [pendingCountKey, appDetailKey, loansKey, recentActivityKey]) {
        queryClient.setQueryData(key, { seeded: true });
      }

      invalidateAfterApplicationCreated(queryClient, {
        institutionId: 'bluehaven',
        applicationId: 'BH-APP-301',
        customerId: 'bluehaven-cus-1',
      });
      expect(queryClient.getQueryState(pendingCountKey)?.isInvalidated).toBe(true);
      expect(queryClient.getQueryState(recentActivityKey)?.isInvalidated).toBe(true);

      for (const key of [pendingCountKey, appDetailKey, loansKey, recentActivityKey]) {
        queryClient.setQueryData(key, { refreshed: true });
      }

      invalidateAfterApplicationDecision(queryClient, {
        institutionId: 'bluehaven',
        applicationId: 'BH-APP-301',
        customerId: 'bluehaven-cus-1',
      });
      expect(queryClient.getQueryState(pendingCountKey)?.isInvalidated).toBe(true);
      expect(queryClient.getQueryState(appDetailKey)?.isInvalidated).toBe(true);
      expect(queryClient.getQueryState(loansKey)?.isInvalidated).toBe(true);

      queryClient.setQueryData(pendingCountKey, { refreshed: true });
      queryClient.setQueryData(appDetailKey, { refreshed: true });

      invalidateAfterApplicationWithdrawn(queryClient, {
        institutionId: 'bluehaven',
        applicationId: 'BH-APP-301',
        customerId: 'bluehaven-cus-1',
      });
      expect(queryClient.getQueryState(pendingCountKey)?.isInvalidated).toBe(true);
      expect(queryClient.getQueryState(appDetailKey)?.isInvalidated).toBe(true);
    });
  });

  describe('Error classification & detail hook states', () => {
    it('distinguishes NotFoundError from transient fetch errors in retry and classification helpers', () => {
      const notFound = new NotFoundError('Loan');
      const serverError = new AppError('Gateway timeout', 'NETWORK_ERROR', 503);

      expect(isNotFoundError(notFound)).toBe(true);
      expect(shouldRetryDetailQuery(0, notFound)).toBe(false);

      expect(isNotFoundError(serverError)).toBe(false);
      expect(shouldRetryDetailQuery(0, serverError)).toBe(true);
      expect(shouldRetryDetailQuery(1, serverError)).toBe(false);
    });

    it('surfaces isError on fetch failure instead of misclassifying as isMissing, and sets isMissing on NotFoundError', async () => {
      const queryClient = createTestQueryClient();
      const getByIdSpy = vi
        .spyOn(loanApiService, 'getById')
        .mockRejectedValue(new AppError('Temporary service outage', 'NETWORK_ERROR', 503));
      const getRepaymentsSpy = vi.spyOn(loanApiService, 'getRepayments');

      const { result } = renderHook(() => useCustomerLoanDetail(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(getByIdSpy).toHaveBeenCalledTimes(2);
      expect(result.current.isError).toBe(true);
      expect(result.current.isMissing).toBe(false);
      expect(result.current.errorMessage).toBe('Temporary service outage');
      expect(getRepaymentsSpy).not.toHaveBeenCalled();

      const missingClient = createTestQueryClient();
      getByIdSpy.mockReset();
      getByIdSpy.mockRejectedValueOnce(new NotFoundError('Loan'));
      navigationState.params = { id: 'BH-LN-999' };

      const { result: missingResult } = renderHook(() => useCustomerLoanDetail(), {
        wrapper: createWrapper(missingClient),
      });

      await waitFor(() => {
        expect(missingResult.current.isLoading).toBe(false);
      });

      expect(getByIdSpy).toHaveBeenCalledTimes(1);
      expect(missingResult.current.isMissing).toBe(true);
      expect(missingResult.current.isError).toBe(false);
    });
  });

  describe('Service-level record scope enforcement & early ownership check', () => {
    it('blocks cross-tenant and cross-borrower record lookups and mutations in services', async () => {
      const bluehavenLoans = await loanApiService.list('bluehaven');
      const targetLoan = bluehavenLoans[0];

      await expect(
        loanApiService.getById(targetLoan.id, { institutionId: 'meridian' }),
      ).rejects.toBeInstanceOf(NotFoundError);

      await expect(
        loanApiService.getById(targetLoan.id, {
          institutionId: 'bluehaven',
          customerId: 'bluehaven-cus-999',
        }),
      ).rejects.toBeInstanceOf(NotFoundError);

      await expect(
        loanApiService.getRepayments(targetLoan.id, {
          institutionId: 'bluehaven',
          customerId: 'bluehaven-cus-999',
        }),
      ).rejects.toBeInstanceOf(NotFoundError);

      const bluehavenApps = await applicationApiService.list('bluehaven');
      const pendingApp = bluehavenApps.find((a) => a.status === APPLICATION_STATUSES.PENDING)!;

      await expect(
        applicationApiService.getById(pendingApp.id, { institutionId: 'meridian' }),
      ).rejects.toBeInstanceOf(NotFoundError);

      await expect(
        applicationApiService.withdraw(pendingApp.id, {
          institutionId: 'bluehaven',
          customerId: 'bluehaven-cus-999',
        }),
      ).rejects.toBeInstanceOf(NotFoundError);

      const bluehavenPayments = await repaymentApiService.list('bluehaven');
      await expect(
        repaymentApiService.getById(bluehavenPayments[0].id, { institutionId: 'meridian' }),
      ).rejects.toBeInstanceOf(NotFoundError);

      await expect(
        customerApiService.getById('bluehaven-cus-1', { institutionId: 'meridian' }),
      ).rejects.toBeInstanceOf(NotFoundError);
    }, 15000);

    it('does not start repayment history fetch if returned loan belongs to a different borrower', async () => {
      const bluehavenLoans = await loanApiService.list('bluehaven');
      const otherBorrowerLoan = bluehavenLoans.find(
        (loan) => loan.customerId !== 'bluehaven-cus-1',
      )!;

      navigationState.params = { id: otherBorrowerLoan.id };
      const queryClient = createTestQueryClient();
      vi.spyOn(loanApiService, 'getById').mockResolvedValueOnce(otherBorrowerLoan);
      const getRepaymentsSpy = vi.spyOn(loanApiService, 'getRepayments');

      const { result } = renderHook(() => useCustomerLoanDetail(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(getRepaymentsSpy).not.toHaveBeenCalled();
      expect(result.current.loan).toBeUndefined();
      expect(result.current.isMissing).toBe(true);
    }, 15000);
  });

  describe('WorkspaceShell lender-scoped pending count', () => {
    it('fetches pending count only in the lender workspace and never fetches all applications in customer portal', async () => {
      const listSpy = vi.spyOn(applicationApiService, 'list');
      const pendingCountSpy = vi.spyOn(applicationApiService, 'getPendingCount');

      navigationState.pathname = '/customer/overview';
      const customerClient = createTestQueryClient();
      const { unmount } = render(
        <WorkspaceShell>
          <div>Customer content</div>
        </WorkspaceShell>,
        { wrapper: createWrapper(customerClient) },
      );

      expect(listSpy).not.toHaveBeenCalled();
      expect(pendingCountSpy).not.toHaveBeenCalled();
      await waitFor(() => expect(customerClient.isFetching()).toBe(0));
      unmount();

      navigationState.pathname = '/lender/overview';
      useAuthStore.setState({
        session: {
          id: 'usr-lender',
          name: 'Tunde Adeyemi',
          email: 'ops@bluehaven.ng',
          role: 'lender',
          institutionId: 'bluehaven',
        },
        isLoading: false,
        isSigningOut: false,
      });

      const lenderClient = createTestQueryClient();
      const { unmount: unmountLender } = render(
        <WorkspaceShell>
          <div>Lender content</div>
        </WorkspaceShell>,
        { wrapper: createWrapper(lenderClient) },
      );

      await waitFor(() => {
        expect(pendingCountSpy).toHaveBeenCalledWith('bluehaven');
      });
      await waitFor(() => expect(lenderClient.isFetching()).toBe(0));
      expect(listSpy).not.toHaveBeenCalled();

      const allBluehavenApps = MockStorageAdapter.getInstance()
        .getDatabase()
        .applications.filter(
          (app) =>
            app.institutionId === 'bluehaven' &&
            (app.status === APPLICATION_STATUSES.PENDING ||
              app.status === APPLICATION_STATUSES.IN_REVIEW),
        );
      const count = await applicationApiService.getPendingCount('bluehaven');
      expect(count).toBe(allBluehavenApps.length);
      unmountLender();
    }, 15000);
  });

  describe('Environment-driven endpoint configuration & HTTP transport swap', () => {
    it('resolves centralized API_ENDPOINTS against API_ENV and switches cleanly to HTTP fetch', async () => {
      expect(globalApiClient.getBaseUrl()).toBe(API_ENV.BASE_URL);
      expect(
        globalApiClient.buildUrl(API_ENDPOINTS.APPLICATIONS.PAGINATED, {
          institutionId: 'bluehaven',
          page: 2,
          search: undefined,
        }),
      ).toBe(`${API_ENV.BASE_URL}/applications/paginated?institutionId=bluehaven&page=2`);

      const fetchMock = vi.fn().mockResolvedValueOnce(
        new Response(JSON.stringify(7), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
      vi.stubGlobal('fetch', fetchMock);

      try {
        const httpClient = new ApiClient('https://api.10mgcredit.example/v2/', 'http');
        httpClient.setAuthHeader('jwt-token-123');
        const remoteApplications = new ApplicationApiService(httpClient);

        const pendingCount = await remoteApplications.getPendingCount('bluehaven');
        expect(pendingCount).toBe(7);
        expect(fetchMock).toHaveBeenCalledWith(
          'https://api.10mgcredit.example/v2/applications/pending-count?institutionId=bluehaven',
          expect.objectContaining({
            method: 'GET',
            headers: expect.objectContaining({
              Authorization: 'Bearer jwt-token-123',
              Accept: 'application/json',
            }),
          }),
        );

        fetchMock.mockResolvedValueOnce(
          new Response(JSON.stringify({ message: 'Application BH-999' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
          }),
        );
        await expect(
          remoteApplications.getById('BH-999', { institutionId: 'bluehaven' }),
        ).rejects.toBeInstanceOf(NotFoundError);
      } finally {
        vi.unstubAllGlobals();
      }
    });
  });
});
