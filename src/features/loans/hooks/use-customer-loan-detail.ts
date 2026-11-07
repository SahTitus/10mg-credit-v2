'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useCustomerScope } from '@/features/customers/hooks/use-customer-scope';
import { loanApiService } from '@/lib/api/loan-service';
import { QUERY_KEYS } from '@/lib/constants/query-keys';
import { getErrorMessage, isNotFoundError } from '@/lib/errors/error-handler';
import { shouldRetryDetailQuery } from '@/lib/utils/query-helpers';

export function useCustomerLoanDetail() {
  const params = useParams<{ id: string }>();
  const loanId = decodeURIComponent(params.id);
  const { institution, customerId } = useCustomerScope();
  const scope = { institutionId: institution.id, customerId };

  const loanQuery = useQuery({
    queryKey: QUERY_KEYS.LOAN_DETAIL(loanId, institution.id, customerId),
    queryFn: () => loanApiService.getById(loanId, scope),
    retry: shouldRetryDetailQuery,
  });

  // Only load repayment history once the loan matches the active institution and borrower
  const loan =
    loanQuery.data?.institutionId === institution.id && loanQuery.data?.customerId === customerId
      ? loanQuery.data
      : undefined;

  const repaymentsQuery = useQuery({
    queryKey: QUERY_KEYS.LOAN_REPAYMENTS(loanId, institution.id, customerId),
    queryFn: () => loanApiService.getRepayments(loanId, scope),
    enabled: Boolean(loan),
  });

  const isNotFound = loanQuery.isError && isNotFoundError(loanQuery.error);
  const isError = (loanQuery.isError && !isNotFound) || repaymentsQuery.isError;
  const isLoading = loanQuery.isPending || (Boolean(loan) && repaymentsQuery.isPending);

  const retry = () => {
    if (loanQuery.isError) void loanQuery.refetch();
    if (repaymentsQuery.isError) void repaymentsQuery.refetch();
  };

  return {
    institution,
    loan,
    schedule: loan ? loanApiService.getSchedule(loan) : [],
    repayments: repaymentsQuery.data ?? [],
    isLoading,
    isError,
    errorMessage: getErrorMessage(
      loanQuery.error ?? repaymentsQuery.error,
      'Unable to load loan details.',
    ),
    retry,
    isRetrying: loanQuery.isRefetching || repaymentsQuery.isRefetching,
    isMissing: !isLoading && !isError && !loan,
  };
}
