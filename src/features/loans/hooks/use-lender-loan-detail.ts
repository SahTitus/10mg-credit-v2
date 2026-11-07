'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { loanApiService } from '@/lib/api/loan-service';
import { QUERY_KEYS } from '@/lib/constants/query-keys';
import { getErrorMessage, isNotFoundError } from '@/lib/errors/error-handler';
import { shouldRetryDetailQuery } from '@/lib/utils/query-helpers';
import { useInstitutionStore } from '@/store/institution-store';

export function useLenderLoanDetail() {
  const { id } = useParams<{ id: string }>();
  const loanId = decodeURIComponent(id);
  const institution = useInstitutionStore((state) => state.currentInstitution);
  const scope = { institutionId: institution.id };

  const loanQuery = useQuery({
    queryKey: QUERY_KEYS.LOAN_DETAIL(loanId, institution.id),
    queryFn: () => loanApiService.getById(loanId, scope),
    retry: shouldRetryDetailQuery,
  });

  const loan = loanQuery.data?.institutionId === institution.id ? loanQuery.data : undefined;

  const repaymentsQuery = useQuery({
    queryKey: QUERY_KEYS.LOAN_REPAYMENTS(loanId, institution.id),
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
    repayments: repaymentsQuery.data ?? [],
    schedule: loan ? loanApiService.getSchedule(loan) : [],
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
