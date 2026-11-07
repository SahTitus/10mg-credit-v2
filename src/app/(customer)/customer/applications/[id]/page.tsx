'use client';

import { Skeleton } from '@/components/primitives/skeleton';
import { QueryErrorState } from '@/components/shared/query-error-state';
import { RecordNotFound } from '@/components/shared/record-not-found';
import { CustomerApplicationDetailView } from '@/features/applications/components/customer-application-detail-view';
import { useCustomerApplicationDetail } from '@/features/applications/hooks/use-customer-application-detail';
import { APP_ROUTES } from '@/lib/constants/routes';

export default function CustomerApplicationDetailPage() {
  const {
    institution,
    application,
    customer,
    linkedLoan,
    monthlyEstimate,
    withdrawMutation,
    isLoading,
    isError,
    errorMessage,
    retry,
    isRetrying,
    isMissing,
  } = useCustomerApplicationDetail();

  if (isLoading) {
    return (
      <div className="workspace-page">
        <Skeleton className="h-20 w-72 rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <QueryErrorState
        title="Unable to load application"
        description={errorMessage}
        onRetry={retry}
        isRetrying={isRetrying}
        backHref={APP_ROUTES.CUSTOMER.APPLICATIONS}
        backLabel="Applications"
      />
    );
  }

  if (isMissing || !application) {
    return <RecordNotFound backHref={APP_ROUTES.CUSTOMER.APPLICATIONS} backLabel="Applications" />;
  }

  return (
    <CustomerApplicationDetailView
      application={application}
      institution={institution}
      customer={customer}
      linkedLoan={linkedLoan}
      monthlyEstimate={monthlyEstimate}
      onWithdraw={() => withdrawMutation.mutate()}
      isWithdrawing={withdrawMutation.isPending}
    />
  );
}
