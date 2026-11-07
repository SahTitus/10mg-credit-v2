'use client';

import * as React from 'react';
import Link from 'next/link';
import { CheckCircle2, Clock, FileText, Plus, TrendingUp } from 'lucide-react';
import { Button } from '@/components/primitives/button';
import { Card } from '@/components/primitives/card';
import { KpiCard } from '@/components/shared/kpi-card';
import { QueryErrorState } from '@/components/shared/query-error-state';
import { ApplicationTracker } from '@/features/applications/components/application-tracker';
import { useCustomerPortfolio } from '@/features/customers/hooks/use-customer-portfolio';
import { APPLICATION_STATUSES } from '@/lib/constants/application-statuses';
import { APP_ROUTES } from '@/lib/constants/routes';
import { formatCurrency } from '@/lib/utils/formatters';

export default function CustomerApplicationsPage() {
  const { institution, applications, isLoading, isError, errorMessage, retry, isRetrying } =
    useCustomerPortfolio();
  const { currency } = institution;

  const metrics = React.useMemo(() => {
    const pendingCount = applications.filter(
      (app) =>
        app.status === APPLICATION_STATUSES.PENDING ||
        app.status === APPLICATION_STATUSES.IN_REVIEW,
    ).length;
    const approvedCount = applications.filter(
      (app) => app.status === APPLICATION_STATUSES.APPROVED,
    ).length;
    const requestedVolume = applications.reduce((sum, app) => sum + app.amount, 0);

    return {
      pendingCount,
      approvedCount,
      requestedVolume,
    };
  }, [applications]);

  return (
    <div className="workspace-page">
      <div className="workspace-heading">
        <div>
          <h1>My applications</h1>
          <p>
            <span className="sm:hidden">Track your requests with {institution.short}.</span>
            <span className="hidden sm:inline">
              Track your pending and decided credit applications with {institution.short}.
            </span>
          </p>
        </div>
        <Link href={APP_ROUTES.CUSTOMER.APPLY} className="self-end shrink-0 sm:self-auto">
          <Button variant="primary">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Apply for credit
          </Button>
        </Link>
      </div>

      {isError ? (
        <Card className="p-4 sm:p-6">
          <QueryErrorState
            title="Unable to load summary"
            description={errorMessage}
            onRetry={retry}
            isRetrying={isRetrying}
          />
        </Card>
      ) : (
        <div className="workspace-kpi-grid">
          <KpiCard
            label="Total requests"
            value={applications.length}
            note="Submitted applications"
            icon={<FileText className="h-4 w-4" />}
            tone="blue"
            sparklineIndex={0}
            isLoading={isLoading}
          />
          <KpiCard
            label="Pending review"
            value={metrics.pendingCount}
            note="Awaiting underwriting decision"
            icon={<Clock className="h-4 w-4" />}
            tone="orange"
            sparklineIndex={1}
            isLoading={isLoading}
          />
          <KpiCard
            label="Approved requests"
            value={metrics.approvedCount}
            note="Cleared for disbursement"
            icon={<CheckCircle2 className="h-4 w-4" />}
            tone="green"
            sparklineIndex={2}
            isLoading={isLoading}
          />
          <KpiCard
            label="Requested volume"
            value={formatCurrency(metrics.requestedVolume, currency, true)}
            note="Total credit applied for"
            icon={<TrendingUp className="h-4 w-4" />}
            tone="violet"
            sparklineIndex={3}
            isLoading={isLoading}
          />
        </div>
      )}

      <ApplicationTracker currency={currency} />
    </div>
  );
}
