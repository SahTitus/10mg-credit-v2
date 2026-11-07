'use client';

import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Button } from '@/components/primitives/button';
import { Card } from '@/components/primitives/card';
import { QueryErrorState } from '@/components/shared/query-error-state';
import { useCustomerPortfolio } from '@/features/customers/hooks/use-customer-portfolio';
import { CustomerLoanList } from '@/features/loans/components/customer-loan-list';
import { CustomerLoanSummary } from '@/features/loans/components/customer-loan-summary';
import { APP_ROUTES } from '@/lib/constants/routes';

export default function CustomerLoansPage() {
  const router = useRouter();
  const portfolio = useCustomerPortfolio();
  const { currency } = portfolio.institution;

  return (
    <div className="workspace-page">
      <div className="workspace-heading">
        <div>
          <h1>My loans</h1>
          <p>Your financing, clearly organised.</p>
        </div>
        <Button
          variant="primary"
          onClick={() => router.push(APP_ROUTES.CUSTOMER.APPLY)}
          className="self-end shrink-0 sm:self-auto"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Apply for credit
        </Button>
      </div>

      {portfolio.isError ? (
        <Card className="p-4 sm:p-6">
          <QueryErrorState
            title="Unable to load summary"
            description={portfolio.errorMessage}
            onRetry={portfolio.retry}
            isRetrying={portfolio.isRetrying}
          />
        </Card>
      ) : (
        <CustomerLoanSummary
          principal={portfolio.totals.principal}
          outstanding={portfolio.totals.outstanding}
          repaid={portfolio.totals.repaid}
          activeCount={portfolio.totals.activeCount}
          completedCount={portfolio.totals.completedCount}
          currency={currency}
          isLoading={portfolio.isLoading}
        />
      )}

      <CustomerLoanList currency={currency} />
    </div>
  );
}
