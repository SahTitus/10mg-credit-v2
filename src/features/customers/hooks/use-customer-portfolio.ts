'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useCustomerScope } from '@/features/customers/hooks/use-customer-scope';
import { applicationApiService } from '@/lib/api/application-service';
import { loanApiService } from '@/lib/api/loan-service';
import { repaymentApiService } from '@/lib/api/repayment-service';
import { LOAN_STATUSES } from '@/lib/constants/application-statuses';
import { QUERY_KEYS } from '@/lib/constants/query-keys';
import { getErrorMessage } from '@/lib/errors/error-handler';
import type { LoanApplication } from '@/types/application';
import type { Loan } from '@/types/loan';
import type { Repayment } from '@/types/repayment';

const EMPTY_LOANS: readonly Loan[] = [];
const EMPTY_APPLICATIONS: readonly LoanApplication[] = [];
const EMPTY_REPAYMENTS: readonly Repayment[] = [];

export function useCustomerPortfolio() {
  const { institution, customerId } = useCustomerScope();

  const loansQuery = useQuery({
    queryKey: QUERY_KEYS.LOANS(institution.id, customerId),
    queryFn: () => loanApiService.list(institution.id, customerId),
  });

  const applicationsQuery = useQuery({
    queryKey: QUERY_KEYS.APPLICATIONS(institution.id, customerId),
    queryFn: () => applicationApiService.list(institution.id, undefined, undefined, customerId),
  });

  const repaymentsQuery = useQuery({
    queryKey: QUERY_KEYS.REPAYMENTS(institution.id, customerId),
    queryFn: () => repaymentApiService.list(institution.id, undefined, customerId),
  });

  const loans = loansQuery.data ?? EMPTY_LOANS;
  const applications = applicationsQuery.data ?? EMPTY_APPLICATIONS;
  const repayments = repaymentsQuery.data ?? EMPTY_REPAYMENTS;

  const totals = React.useMemo(() => {
    const principal = loans.reduce((sum, loan) => sum + loan.principal, 0);
    const outstanding = loans.reduce(
      (sum, loan) => sum + Math.max(0, loan.totalDue - loan.paid),
      0,
    );
    const repaid = repayments.reduce((sum, payment) => sum + payment.amount, 0);
    // Overdue loans still count as open credit until they are fully repaid
    const active = loans.filter((loan) => loan.status !== LOAN_STATUSES.COMPLETED);

    return {
      principal,
      outstanding,
      repaid,
      activeCount: active.length,
      completedCount: loans.length - active.length,
    };
  }, [loans, repayments]);

  const isLoading =
    loansQuery.isPending || applicationsQuery.isPending || repaymentsQuery.isPending;
  const isError = loansQuery.isError || applicationsQuery.isError || repaymentsQuery.isError;
  const errorMessage = getErrorMessage(
    loansQuery.error ?? applicationsQuery.error ?? repaymentsQuery.error,
    'Unable to load your credit portfolio.',
  );

  const retry = React.useCallback(() => {
    if (loansQuery.isError) void loansQuery.refetch();
    if (applicationsQuery.isError) void applicationsQuery.refetch();
    if (repaymentsQuery.isError) void repaymentsQuery.refetch();
  }, [applicationsQuery, loansQuery, repaymentsQuery]);

  return {
    institution,
    customerId,
    loans,
    applications,
    repayments,
    totals,
    isLoading,
    isError,
    errorMessage,
    retry,
    isRetrying:
      loansQuery.isRefetching || applicationsQuery.isRefetching || repaymentsQuery.isRefetching,
  };
}
