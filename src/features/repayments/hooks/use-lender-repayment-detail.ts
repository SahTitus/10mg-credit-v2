'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { loanApiService } from '@/lib/api/loan-service';
import { repaymentApiService } from '@/lib/api/repayment-service';
import { QUERY_KEYS } from '@/lib/constants/query-keys';
import { getErrorMessage, isNotFoundError } from '@/lib/errors/error-handler';
import { shouldRetryDetailQuery } from '@/lib/utils/query-helpers';
import { useInstitutionStore } from '@/store/institution-store';

export function useLenderRepaymentDetail() {
  const { id } = useParams<{ id: string }>();
  const repaymentId = decodeURIComponent(id);
  const institution = useInstitutionStore((state) => state.currentInstitution);
  const scope = { institutionId: institution.id };

  const paymentQuery = useQuery({
    queryKey: QUERY_KEYS.REPAYMENT_DETAIL(repaymentId, institution.id),
    queryFn: () => repaymentApiService.getById(repaymentId, scope),
    retry: shouldRetryDetailQuery,
  });

  // A direct record URL must still belong to the selected institution
  const payment =
    paymentQuery.data?.institutionId === institution.id ? paymentQuery.data : undefined;
  const loanId = payment?.loanId ?? '';

  const loanQuery = useQuery({
    queryKey: QUERY_KEYS.LOAN_DETAIL(loanId, institution.id),
    queryFn: () => loanApiService.getById(loanId, scope),
    enabled: Boolean(loanId),
    retry: shouldRetryDetailQuery,
  });

  const historyQuery = useQuery({
    queryKey: QUERY_KEYS.LOAN_REPAYMENTS(loanId, institution.id),
    queryFn: () => loanApiService.getRepayments(loanId, scope),
    enabled: Boolean(loanId),
  });

  const isNotFound = paymentQuery.isError && isNotFoundError(paymentQuery.error);
  const isLoanUnexpectedError = loanQuery.isError && !isNotFoundError(loanQuery.error);
  const isError =
    (paymentQuery.isError && !isNotFound) || isLoanUnexpectedError || historyQuery.isError;
  const isLoading = paymentQuery.isPending || (Boolean(loanId) && historyQuery.isPending);

  const retry = () => {
    if (paymentQuery.isError) void paymentQuery.refetch();
    if (loanQuery.isError) void loanQuery.refetch();
    if (historyQuery.isError) void historyQuery.refetch();
  };

  return {
    institution,
    payment,
    loan: loanQuery.data,
    history: historyQuery.data ?? [],
    isLoading,
    isError,
    errorMessage: getErrorMessage(
      paymentQuery.error ?? loanQuery.error ?? historyQuery.error,
      'Unable to load payment receipt.',
    ),
    retry,
    isRetrying: paymentQuery.isRefetching || loanQuery.isRefetching || historyQuery.isRefetching,
    isMissing: !isLoading && !isError && !payment,
  };
}
