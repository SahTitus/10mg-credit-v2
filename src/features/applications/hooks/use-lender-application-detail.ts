'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/primitives/toast';
import { applicationApiService } from '@/lib/api/application-service';
import { loanApiService } from '@/lib/api/loan-service';
import { APPLICATION_STATUSES } from '@/lib/constants/application-statuses';
import { QUERY_KEYS } from '@/lib/constants/query-keys';
import { getErrorMessage, isNotFoundError } from '@/lib/errors/error-handler';
import { shouldRetryDetailQuery } from '@/lib/utils/query-helpers';
import { invalidateAfterApplicationDecision } from '@/lib/utils/query-invalidation';
import { useInstitutionStore } from '@/store/institution-store';
import type { ApplicationStatus } from '@/types/application';

export function useLenderApplicationDetail() {
  const { id } = useParams<{ id: string }>();
  const applicationId = decodeURIComponent(id);
  const router = useRouter();
  const queryClient = useQueryClient();
  const institution = useInstitutionStore((state) => state.currentInstitution);
  const { toast, error: toastError } = useToast();
  const [noteState, setNote] = React.useState<string | undefined>();

  const query = useQuery({
    queryKey: QUERY_KEYS.APPLICATION_DETAIL(applicationId, institution.id),
    queryFn: () => applicationApiService.getById(applicationId, { institutionId: institution.id }),
    retry: shouldRetryDetailQuery,
  });

  const application = query.data?.institutionId === institution.id ? query.data : undefined;

  const loansQuery = useQuery({
    queryKey: QUERY_KEYS.LOANS(institution.id),
    queryFn: () => loanApiService.list(institution.id),
    enabled: Boolean(application) && application?.status === APPLICATION_STATUSES.APPROVED,
  });

  const linkedLoan = React.useMemo(
    () => (loansQuery.data ?? []).find((loan) => loan.applicationId === applicationId),
    [applicationId, loansQuery.data],
  );

  const monthlyEstimate = React.useMemo(() => {
    if (!application) return 0;
    // Match the loan total calculation before an approval creates a facility
    const total = Math.round(
      application.amount * (1 + (institution.interest * application.term) / 1200),
    );
    return Math.round(total / application.term);
  }, [application, institution.interest]);

  // Fall back to the saved note until the reviewer edits the field locally
  const note = noteState ?? application?.note ?? '';

  const decisionMutation = useMutation({
    mutationFn: (status: ApplicationStatus) =>
      applicationApiService.updateStatus(applicationId, status, note),
    onSuccess: (updated) => {
      invalidateAfterApplicationDecision(queryClient, {
        institutionId: institution.id,
        applicationId,
        customerId: updated.customerId,
      });
      toast('Decision recorded', `${updated.id} marked as ${updated.status}`, 'success');
      if (updated.status === APPLICATION_STATUSES.APPROVED) router.refresh();
    },
    onError: (error) =>
      toastError('Update failed', error instanceof Error ? error.message : 'Try again shortly'),
  });

  const isNotFound = query.isError && isNotFoundError(query.error);
  const isError = (query.isError && !isNotFound) || loansQuery.isError;
  const isLoading = query.isPending;

  const retry = () => {
    if (query.isError) void query.refetch();
    if (loansQuery.isError) void loansQuery.refetch();
  };

  return {
    application,
    decisionMutation,
    institution,
    linkedLoan,
    monthlyEstimate,
    isLoading,
    isError,
    errorMessage: getErrorMessage(
      query.error ?? loansQuery.error,
      'Unable to load application details.',
    ),
    retry,
    isRetrying: query.isRefetching || loansQuery.isRefetching,
    isMissing: !isLoading && !isError && !application,
    note,
    setNote,
  };
}
