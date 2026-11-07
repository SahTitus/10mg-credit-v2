'use client';

import { CustomerLoanDetailView } from '@/features/loans/components/customer-loan-detail-view';
import { useLenderLoanDetail } from '@/features/loans/hooks/use-lender-loan-detail';
import { QueryErrorState } from '@/components/shared/query-error-state';
import { RecordNotFound } from '@/components/shared/record-not-found';
import { APP_ROUTE_BUILDERS, APP_ROUTES } from '@/lib/constants/routes';
import { Skeleton } from '@/components/primitives/skeleton';

export default function LenderLoanDetailPage() {
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
  } = useLenderLoanDetail();
  if (isLoading)
    return (
      <div className="space-y-5">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
    );
  if (isError)
    return (
      <QueryErrorState
        title="Unable to load loan"
        description={errorMessage}
        onRetry={retry}
        isRetrying={isRetrying}
        backHref={APP_ROUTES.LENDER.LOANS}
        backLabel="Loans"
      />
    );
  if (isMissing || !loan)
    return <RecordNotFound backHref={APP_ROUTES.LENDER.LOANS} backLabel="Loans" />;
  return (
    <CustomerLoanDetailView
      loan={loan}
      institution={institution}
      repayments={repayments}
      schedule={schedule}
      backHref={APP_ROUTES.LENDER.LOANS}
      backLabel="Loans"
      applicationHref={APP_ROUTE_BUILDERS.LENDER.APPLICATION}
      paymentHref={APP_ROUTE_BUILDERS.LENDER.REPAYMENT}
    />
  );
}
