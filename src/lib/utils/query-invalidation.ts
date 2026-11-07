import type { QueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/constants/query-keys';

export interface RepaymentInvalidationContext {
  institutionId: string;
  loanId: string;
  repaymentId?: string;
  customerId?: string;
}

export interface ApplicationInvalidationContext {
  institutionId: string;
  applicationId?: string;
  customerId?: string;
}

export function invalidateAfterRepayment(
  queryClient: QueryClient,
  context: RepaymentInvalidationContext,
): void {
  const { institutionId, loanId, repaymentId, customerId } = context;

  // Recording a payment updates loan balances, borrower totals, dashboard metrics, and activity feeds
  void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.REPAYMENTS_SCOPE(institutionId) });
  void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LOANS_SCOPE(institutionId) });
  void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LOAN_SCOPE(loanId) });
  void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LOAN_REPAYMENTS_SCOPE(loanId) });
  void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD_SCOPE(institutionId) });
  void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.NOTIFICATIONS(institutionId) });
  void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CUSTOMERS_SCOPE(institutionId) });

  if (repaymentId) {
    void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.REPAYMENT_SCOPE(repaymentId) });
  }
  if (customerId) {
    void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CUSTOMER_SCOPE(customerId) });
  }
}

export function invalidateAfterApplicationCreated(
  queryClient: QueryClient,
  context: ApplicationInvalidationContext,
): void {
  const { institutionId, applicationId, customerId } = context;

  void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.APPLICATIONS_SCOPE(institutionId) });
  void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CUSTOMERS_SCOPE(institutionId) });
  void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD_SCOPE(institutionId) });
  void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.NOTIFICATIONS(institutionId) });

  if (applicationId) {
    void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.APPLICATION_SCOPE(applicationId) });
  }
  if (customerId) {
    void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CUSTOMER_SCOPE(customerId) });
  }
}

export function invalidateAfterApplicationDecision(
  queryClient: QueryClient,
  context: ApplicationInvalidationContext & { applicationId: string },
): void {
  const { institutionId, applicationId, customerId } = context;

  // Approving an application creates a new loan facility and updates the borrower directory
  void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.APPLICATION_SCOPE(applicationId) });
  void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.APPLICATIONS_SCOPE(institutionId) });
  void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LOANS_SCOPE(institutionId) });
  void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CUSTOMERS_SCOPE(institutionId) });
  void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD_SCOPE(institutionId) });
  void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.NOTIFICATIONS(institutionId) });

  if (customerId) {
    void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CUSTOMER_SCOPE(customerId) });
  }
}

export function invalidateAfterApplicationWithdrawn(
  queryClient: QueryClient,
  context: ApplicationInvalidationContext & { applicationId: string },
): void {
  const { institutionId, applicationId, customerId } = context;

  void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.APPLICATION_SCOPE(applicationId) });
  void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.APPLICATIONS_SCOPE(institutionId) });
  void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD_SCOPE(institutionId) });

  if (customerId) {
    void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CUSTOMER_SCOPE(customerId) });
  }
}

export function invalidateAfterInstitutionSettingsUpdated(
  queryClient: QueryClient,
  institutionId: string,
): void {
  void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.INSTITUTION(institutionId) });
  void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.INSTITUTIONS_ALL });
}
