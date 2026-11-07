'use client';

import { CustomerPaymentReceipt } from '@/features/repayments/components/customer-payment-receipt';
import { useLenderRepaymentDetail } from '@/features/repayments/hooks/use-lender-repayment-detail';
import { QueryErrorState } from '@/components/shared/query-error-state';
import { RecordNotFound } from '@/components/shared/record-not-found';
import { APP_ROUTE_BUILDERS, APP_ROUTES } from '@/lib/constants/routes';
import { Skeleton } from '@/components/primitives/skeleton';

export default function LenderRepaymentDetailPage() {
  const {
    institution,
    payment,
    loan,
    history,
    isLoading,
    isError,
    errorMessage,
    retry,
    isRetrying,
    isMissing,
  } = useLenderRepaymentDetail();
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
        title="Unable to load receipt"
        description={errorMessage}
        onRetry={retry}
        isRetrying={isRetrying}
        backHref={APP_ROUTES.LENDER.REPAYMENTS}
        backLabel="Repayments"
      />
    );
  if (isMissing || !payment)
    return <RecordNotFound backHref={APP_ROUTES.LENDER.REPAYMENTS} backLabel="Repayments" />;
  return (
    <CustomerPaymentReceipt
      payment={payment}
      institution={institution}
      loan={loan}
      history={history}
      backHref={APP_ROUTES.LENDER.REPAYMENTS}
      backLabel="Repayments"
      paymentHref={APP_ROUTE_BUILDERS.LENDER.REPAYMENT}
      loanHref={APP_ROUTE_BUILDERS.LENDER.LOAN}
    />
  );
}
