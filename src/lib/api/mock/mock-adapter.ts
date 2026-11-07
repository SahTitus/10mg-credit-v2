import {
  handleApplicationsList,
  handleApplicationsPaginated,
  handleApplicationsPendingCount,
  handleApplicationGetById,
  handleApplicationCreate,
  handleApplicationUpdateStatus,
  handleApplicationWithdraw,
} from './mock-application-handlers';
import {
  handleLoansList,
  handleLoansPaginated,
  handleLoanGetById,
  handleLoanGetRepayments,
} from './mock-loan-handlers';
import {
  handleRepaymentsList,
  handleRepaymentsPaginated,
  handleRepaymentGetById,
  handleRepaymentRecord,
} from './mock-repayment-handlers';
import {
  handleAuthLogin,
  handleAuthSession,
  handleAuthLogout,
  handleInstitutionsGetAll,
  handleInstitutionGetById,
  handleInstitutionUpdateSettings,
  handleCustomersList,
  handleCustomersPaginated,
  handleCustomerGetById,
  handleDashboardLenderMetrics,
  handleDashboardCustomerMetrics,
  handleDashboardActivities,
  handleNotificationsList,
  handleNotificationMarkRead,
  handleNotificationsMarkAllRead,
} from './mock-platform-handlers';
import { NotFoundError } from '@/lib/errors/app-error';
import type { RequestParams } from '../api-client';

export class MockApiAdapter {
  public async handle<T>(
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
    endpoint: string,
    body?: unknown,
    params?: RequestParams,
  ): Promise<T> {
    await this.simulateLatency(method);
    const resolvedParams = params ?? {};
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

    // Auth
    if (path === '/auth/login' && method === 'POST') {
      return handleAuthLogin(body as never) as T;
    }
    if (path === '/auth/session' && method === 'GET') {
      return handleAuthSession() as T;
    }
    if (path === '/auth/logout' && method === 'POST') {
      return handleAuthLogout() as T;
    }

    // Institutions
    if (path === '/institutions' && method === 'GET') {
      return handleInstitutionsGetAll() as T;
    }
    const institutionMatch = path.match(/^\/institutions\/([^/]+)$/);
    if (institutionMatch) {
      const id = decodeURIComponent(institutionMatch[1]);
      if (method === 'GET') return handleInstitutionGetById(id) as T;
      if (method === 'PATCH') return handleInstitutionUpdateSettings(id, body as never) as T;
    }

    // Dashboard
    if (path === '/dashboard/lender/metrics' && method === 'GET') {
      return handleDashboardLenderMetrics(resolvedParams) as T;
    }
    if (path === '/dashboard/customer/metrics' && method === 'GET') {
      return handleDashboardCustomerMetrics(resolvedParams) as T;
    }
    if (path === '/dashboard/lender/activities' && method === 'GET') {
      return handleDashboardActivities(resolvedParams) as T;
    }

    // Applications
    if (path === '/applications' && method === 'GET') {
      return handleApplicationsList(resolvedParams) as T;
    }
    if (path === '/applications' && method === 'POST') {
      return handleApplicationCreate(body as never) as T;
    }
    if (path === '/applications/paginated' && method === 'GET') {
      return handleApplicationsPaginated(resolvedParams) as T;
    }
    if (path === '/applications/pending-count' && method === 'GET') {
      return handleApplicationsPendingCount(resolvedParams) as T;
    }
    const appStatusMatch = path.match(/^\/applications\/([^/]+)\/status$/);
    if (appStatusMatch && method === 'PATCH') {
      return handleApplicationUpdateStatus(
        decodeURIComponent(appStatusMatch[1]),
        body as never,
      ) as T;
    }
    const appWithdrawMatch = path.match(/^\/applications\/([^/]+)\/withdraw$/);
    if (appWithdrawMatch && method === 'DELETE') {
      return handleApplicationWithdraw(
        decodeURIComponent(appWithdrawMatch[1]),
        resolvedParams,
      ) as T;
    }
    const appMatch = path.match(/^\/applications\/([^/]+)$/);
    if (appMatch && method === 'GET') {
      return handleApplicationGetById(decodeURIComponent(appMatch[1]), resolvedParams) as T;
    }

    // Customers
    if (path === '/customers' && method === 'GET') {
      return handleCustomersList(resolvedParams) as T;
    }
    if (path === '/customers/paginated' && method === 'GET') {
      return handleCustomersPaginated(resolvedParams) as T;
    }
    const customerMatch = path.match(/^\/customers\/([^/]+)$/);
    if (customerMatch && method === 'GET') {
      return handleCustomerGetById(decodeURIComponent(customerMatch[1]), resolvedParams) as T;
    }

    // Loans
    if (path === '/loans' && method === 'GET') {
      return handleLoansList(resolvedParams) as T;
    }
    if (path === '/loans/paginated' && method === 'GET') {
      return handleLoansPaginated(resolvedParams) as T;
    }
    const loanRepaymentsMatch = path.match(/^\/loans\/([^/]+)\/repayments$/);
    if (loanRepaymentsMatch && method === 'GET') {
      return handleLoanGetRepayments(
        decodeURIComponent(loanRepaymentsMatch[1]),
        resolvedParams,
      ) as T;
    }
    const loanMatch = path.match(/^\/loans\/([^/]+)$/);
    if (loanMatch && method === 'GET') {
      return handleLoanGetById(decodeURIComponent(loanMatch[1]), resolvedParams) as T;
    }

    // Repayments
    if (path === '/repayments' && method === 'GET') {
      return handleRepaymentsList(resolvedParams) as T;
    }
    if (path === '/repayments' && method === 'POST') {
      return handleRepaymentRecord(body as never) as T;
    }
    if (path === '/repayments/paginated' && method === 'GET') {
      return handleRepaymentsPaginated(resolvedParams) as T;
    }
    const repaymentMatch = path.match(/^\/repayments\/([^/]+)$/);
    if (repaymentMatch && method === 'GET') {
      return handleRepaymentGetById(decodeURIComponent(repaymentMatch[1]), resolvedParams) as T;
    }

    // Notifications
    if (path === '/notifications' && method === 'GET') {
      return handleNotificationsList(resolvedParams) as T;
    }
    const notifReadMatch = path.match(/^\/notifications\/([^/]+)\/read$/);
    if (notifReadMatch && method === 'PATCH') {
      return handleNotificationMarkRead(decodeURIComponent(notifReadMatch[1])) as T;
    }
    if (path === '/notifications/read-all' && method === 'POST') {
      return handleNotificationsMarkAllRead(body as never) as T;
    }

    throw new NotFoundError(`Mock route not found: ${method} ${path}`);
  }

  private async simulateLatency(method: string): Promise<void> {
    const ms = method === 'GET' ? 180 : 300;
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const mockApiAdapter = new MockApiAdapter();
