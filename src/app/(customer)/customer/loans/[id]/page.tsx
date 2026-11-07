'use client';

import { Skeleton } from '@/components/primitives/skeleton';
import { QueryErrorState } from '@/components/shared/query-error-state';
import { RecordNotFound } from '@/components/shared/record-not-found';
import { CustomerLoanDetailView } from '@/features/loans/components/customer-loan-detail-view';
import { useCustomerLoanDetail } from '@/features/loans/hooks/use-customer-loan-detail';
import { APP_ROUTES } from '@/lib/constants/routes';

export default function CustomerLoanDetailPage() {
  const {
    institution,
    loan,
    repayments,
    schedule,
    isLoading,
    isError,
    errorMessage,
    retry,
    isRetrying,
    isMissing,
  } = useCustomerLoanDetail();

  if (isLoading) {
    return (
      <div className="workspace-page">
        <Skeleton className="h-20 w-72 rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <QueryErrorState
        title="Unable to load loan"
        description={errorMessage}
        onRetry={retry}
        isRetrying={isRetrying}
        backHref={APP_ROUTES.CUSTOMER.LOANS}
        backLabel="My loans"
      />
    );
  }

  if (isMissing || !loan) {
    return <RecordNotFound backHref={APP_ROUTES.CUSTOMER.LOANS} backLabel="My loans" />;
  }

  return (
    <CustomerLoanDetailView
      loan={loan}
      institution={institution}
      repayments={repayments}
      schedule={schedule}
    />
  );
}
