'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/primitives/toast';
import { useCustomerScope } from '@/features/customers/hooks/use-customer-scope';
import { applicationApiService } from '@/lib/api/application-service';
import { customerApiService } from '@/lib/api/customer-service';
import { loanApiService } from '@/lib/api/loan-service';
import { APPLICATION_STATUSES } from '@/lib/constants/application-statuses';
import { QUERY_KEYS } from '@/lib/constants/query-keys';
import { APP_ROUTES } from '@/lib/constants/routes';
import { getErrorMessage, isNotFoundError } from '@/lib/errors/error-handler';
import { shouldRetryDetailQuery } from '@/lib/utils/query-helpers';
import { invalidateAfterApplicationWithdrawn } from '@/lib/utils/query-invalidation';

export function useCustomerApplicationDetail() {
  const params = useParams<{ id: string }>();
  const applicationId = decodeURIComponent(params.id);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast, error: toastError } = useToast();
  const { institution, customerId } = useCustomerScope();
  const scope = { institutionId: institution.id, customerId };

  const applicationQuery = useQuery({
    queryKey: QUERY_KEYS.APPLICATION_DETAIL(applicationId, institution.id, customerId),
    queryFn: () => applicationApiService.getById(applicationId, scope),
    retry: shouldRetryDetailQuery,
  });

  // Wait to load related records until we confirm this application belongs to the active borrower
  const application =
    applicationQuery.data?.institutionId === institution.id &&
    applicationQuery.data?.customerId === customerId
      ? applicationQuery.data
      : undefined;

  const customerQuery = useQuery({
    queryKey: QUERY_KEYS.CUSTOMER_DETAIL(customerId, institution.id),
    queryFn: () => customerApiService.getById(customerId, { institutionId: institution.id }),
    enabled: Boolean(application),
    retry: shouldRetryDetailQuery,
  });

  const loansQuery = useQuery({
    queryKey: QUERY_KEYS.LOANS(institution.id, customerId),
    queryFn: () => loanApiService.list(institution.id, customerId),
    enabled: Boolean(application) && application?.status === APPLICATION_STATUSES.APPROVED,
  });

  const withdrawMutation = useMutation({
    mutationFn: () => applicationApiService.withdraw(applicationId, scope),
    onSuccess: () => {
      invalidateAfterApplicationWithdrawn(queryClient, {
        institutionId: institution.id,
        applicationId,
        customerId,
      });
      toast('Application withdrawn', `Request #${applicationId} has been withdrawn`, 'info');
      router.push(APP_ROUTES.CUSTOMER.APPLICATIONS);
    },
    onError: (err) => {
      toastError(
        'Could not withdraw',
        err instanceof Error ? err.message : 'Unable to withdraw application',
      );
    },
  });

  const linkedLoan = React.useMemo(
    () => (loansQuery.data ?? []).find((loan) => loan.applicationId === applicationId),
    [applicationId, loansQuery.data],
  );

  const monthlyEstimate = React.useMemo(() => {
    if (!application) return 0;
    const total = Math.round(
      application.amount * (1 + (institution.interest * application.term) / 1200),
    );
    return Math.round(total / application.term);
  }, [application, institution.interest]);

  const isNotFound = applicationQuery.isError && isNotFoundError(applicationQuery.error);
  const isError = (applicationQuery.isError && !isNotFound) || loansQuery.isError;
  const isLoading = applicationQuery.isPending;

  const retry = () => {
    if (applicationQuery.isError) void applicationQuery.refetch();
    if (customerQuery.isError) void customerQuery.refetch();
    if (loansQuery.isError) void loansQuery.refetch();
  };

  return {
    institution,
    application,
    customer: customerQuery.data,
    linkedLoan,
    monthlyEstimate,
    withdrawMutation,
    isLoading,
    isError,
    errorMessage: getErrorMessage(
      applicationQuery.error ?? loansQuery.error,
      'Unable to load application details.',
    ),
    retry,
    isRetrying: applicationQuery.isRefetching || loansQuery.isRefetching,
    isMissing: !isLoading && !isError && !application,
  };
}
