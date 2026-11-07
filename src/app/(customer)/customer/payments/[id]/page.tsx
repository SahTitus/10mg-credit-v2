'use client';

import { Skeleton } from '@/components/primitives/skeleton';
import { QueryErrorState } from '@/components/shared/query-error-state';
import { RecordNotFound } from '@/components/shared/record-not-found';
import { CustomerPaymentReceipt } from '@/features/repayments/components/customer-payment-receipt';
import { useCustomerPaymentDetail } from '@/features/repayments/hooks/use-customer-payment-detail';
import { APP_ROUTES } from '@/lib/constants/routes';

export default function CustomerPaymentDetailPage() {
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
  } = useCustomerPaymentDetail();

  if (isLoading) {
    return (
      <div className="workspace-page">
        <Skeleton className="h-20 w-72 rounded-xl" />
        <Skeleton className="h-72 w-full rounded-xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <QueryErrorState
        title="Unable to load receipt"
        description={errorMessage}
        onRetry={retry}
        isRetrying={isRetrying}
        backHref={APP_ROUTES.CUSTOMER.PAYMENTS}
        backLabel="Payments"
      />
    );
  }

  if (isMissing || !payment) {
    return <RecordNotFound backHref={APP_ROUTES.CUSTOMER.PAYMENTS} backLabel="Payments" />;
  }

  return (
    <CustomerPaymentReceipt
      payment={payment}
      institution={institution}
      loan={loan}
      history={history}
    />
  );
}
