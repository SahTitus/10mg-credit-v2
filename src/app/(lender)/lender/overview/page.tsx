'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ArrowUpRight, CheckCircle2, Clock, Plus, TrendingUp, Wallet } from 'lucide-react';
import { Avatar } from '@/components/primitives/avatar';
import { StatusBadge } from '@/components/primitives/badge';
import { Button } from '@/components/primitives/button';
import { Skeleton } from '@/components/primitives/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/primitives/table';
import { KpiCard } from '@/components/shared/kpi-card';
import { LenderRecentActivity } from '@/components/shared/lender-recent-activity';
import { LendingPerformanceChart } from '@/components/shared/lending-performance-chart';
import { QueryErrorState } from '@/components/shared/query-error-state';
import { MobileDataCard, ResponsiveDataList } from '@/components/shared/responsive-data-list';
import { ViewAllLink } from '@/components/shared/view-all-link';
import { LenderApplicationActionsMenu } from '@/features/applications/components/lender-application-actions-menu';
import { applicationApiService } from '@/lib/api/application-service';
import { dashboardApiService } from '@/lib/api/dashboard-service';
import { PAGINATION_DEFAULTS } from '@/lib/constants/pagination';
import { QUERY_KEYS } from '@/lib/constants/query-keys';
import { APP_ROUTE_BUILDERS, APP_ROUTES } from '@/lib/constants/routes';
import { getErrorMessage } from '@/lib/errors/error-handler';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import { useAuthStore } from '@/store/auth-store';
import { useInstitutionStore } from '@/store/institution-store';

export default function LenderOverviewPage() {
  const router = useRouter();
  const currentInstitution = useInstitutionStore((s) => s.currentInstitution);
  const session = useAuthStore((s) => s.session);
  const [chartRange, setChartRange] = React.useState<6 | 12>(6);

  const {
    data: metrics,
    isPending: isMetricsLoading,
    isError: isMetricsError,
    error: metricsError,
    refetch: refetchMetrics,
    isRefetching: isMetricsRefetching,
  } = useQuery({
    queryKey: QUERY_KEYS.DASHBOARD_METRICS(currentInstitution.id, 'lender'),
    queryFn: () => dashboardApiService.getLenderMetrics(currentInstitution.id),
  });

  const {
    data: recentAppsData,
    isPending: isAppsLoading,
    isError: isAppsError,
    error: appsError,
    refetch: refetchApps,
    isRefetching: isAppsRefetching,
  } = useQuery({
    queryKey: QUERY_KEYS.APPLICATIONS_PAGINATED(
      currentInstitution.id,
      'All',
      '',
      PAGINATION_DEFAULTS.INITIAL_PAGE,
    ),
    queryFn: () =>
      applicationApiService.listPaginated({
        institutionId: currentInstitution.id,
        status: 'All',
        page: PAGINATION_DEFAULTS.INITIAL_PAGE,
        pageSize: PAGINATION_DEFAULTS.PAGE_SIZE,
      }),
  });

  const chartData = React.useMemo(
    () => dashboardApiService.getChartData(currentInstitution.id, chartRange),
    [currentInstitution.id, chartRange],
  );

  const recentApplications = recentAppsData?.items ?? [];
  const queueStats = recentAppsData?.summary ?? {
    pendingCount: 0,
    pendingValue: 0,
    approvedCount: 0,
    approvalRate: 0,
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const displayName = session?.name || 'Alex Okafor';
  const reviewsCount = metrics?.pendingReviewCount ?? queueStats.pendingCount;

  return (
    <div className="workspace-page">
      <div className="workspace-heading">
        <div>
          <h1>
            {greeting}, {displayName.split(' ')[0]}
          </h1>
          <p>
            <span className="sm:hidden">Your lending portfolio in one place.</span>
            <span className="hidden sm:inline">
              A clear view of your lending portfolio, all in one place.
            </span>
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => router.push(APP_ROUTE_BUILDERS.LENDER.NEW_APPLICATION)}
          className="self-end shrink-0 sm:self-auto"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span>New application</span>
        </Button>
      </div>

      {isMetricsError ? (
        <div className="card p-4 sm:p-6">
          <QueryErrorState
            title="Unable to load portfolio metrics"
            description={getErrorMessage(metricsError, 'Could not load dashboard metrics.')}
            onRetry={() => {
              void refetchMetrics();
            }}
            isRetrying={isMetricsRefetching}
          />
        </div>
      ) : (
        <div className="metric-grid">
          <KpiCard
            label="Total disbursed"
            value={formatCurrency(metrics?.totalDisbursed, currentInstitution.currency, true)}
            note={`${metrics?.fundedLoansCount ?? 0} funded loans`}
            icon={<TrendingUp className="h-4 w-4" />}
            tone="blue"
            sparklineIndex={0}
            isLoading={isMetricsLoading}
          />
          <KpiCard
            label="Active loans"
            value={metrics?.activeLoansCount ?? 0}
            note={`${formatCurrency(metrics?.outstandingBalance, currentInstitution.currency, true)} outstanding`}
            icon={<Wallet className="h-4 w-4" />}
            tone="violet"
            sparklineIndex={1}
            isLoading={isMetricsLoading}
          />
          <KpiCard
            label="Pending review"
            value={reviewsCount}
            note={`${reviewsCount} awaiting decision`}
            icon={<Clock className="h-4 w-4" />}
            tone="orange"
            sparklineIndex={2}
            isLoading={isMetricsLoading}
          />
          <KpiCard
            label="Collected to date"
            value={formatCurrency(metrics?.totalCollected, currentInstitution.currency, true)}
            note={`${metrics?.recordedRepaymentsCount ?? 0} recorded repayments`}
            icon={<CheckCircle2 className="h-4 w-4" />}
            tone="green"
            sparklineIndex={3}
            isLoading={isMetricsLoading}
          />
        </div>
      )}

      <div className="dashboard-middle">
        <LendingPerformanceChart
          data={chartData}
          currency={currentInstitution.currency}
          range={chartRange}
          onRangeChange={setChartRange}
        />

        <section
          className="insight-band lender-insight order-first min-[1141px]:order-0"
          aria-label="Review queue"
        >
          <div className="insight-copy">
            <span className="insight-eyebrow">Review queue</span>

            <div className="insight-figure">
              <strong>{reviewsCount}</strong>
              <span>
                {reviewsCount === 1 ? 'decision awaiting review' : 'decisions awaiting review'}
              </span>
            </div>

            <dl className="insight-stats">
              <div>
                <dt>Value awaiting decision</dt>
                <dd>
                  {formatCurrency(queueStats.pendingValue, currentInstitution.currency, true)}
                </dd>
              </div>
              <div>
                <dt>Approved to date</dt>
                <dd>{queueStats.approvedCount} applications</dd>
              </div>
              <div>
                <dt>Approval rate</dt>
                <dd>{queueStats.approvalRate}%</dd>
              </div>
            </dl>

            <Button
              variant="primary"
              onClick={() => router.push(APP_ROUTES.LENDER.APPLICATIONS)}
              className="customer-hero-action insight-cta"
            >
              {reviewsCount > 0 ? 'Review applications' : 'View applications'}
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 items-start gap-4.75 min-[1141px]:grid-cols-[minmax(0,1.55fr)_minmax(300px,1fr)]">
        <section className="card data-card min-w-0">
          <div className="data-card-header">
            <div>
              <h2>Recent applications</h2>
              <p>Latest requests across {currentInstitution.short}</p>
            </div>
            <ViewAllLink href={APP_ROUTES.LENDER.APPLICATIONS} />
          </div>

          {isAppsLoading ? (
            <div className="space-y-3 p-6">
              {[1, 2, 3].map((n) => (
                <Skeleton key={n} className="h-12 w-full" />
              ))}
            </div>
          ) : isAppsError ? (
            <QueryErrorState
              className="m-5"
              title="Unable to load recent applications"
              description={getErrorMessage(appsError, 'Could not load recent applications.')}
              onRetry={() => {
                void refetchApps();
              }}
              isRetrying={isAppsRefetching}
            />
          ) : recentApplications.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              No recent applications found.
            </div>
          ) : (
            <ResponsiveDataList
              table={
                <Table variant="data">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reference</TableHead>
                      <TableHead>Applicant</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentApplications.map((app) => (
                      <TableRow
                        key={app.id}
                        onClick={() => router.push(APP_ROUTE_BUILDERS.LENDER.APPLICATION(app.id))}
                        className="clickable-row cursor-pointer"
                      >
                        <TableCell>
                          <span className="primary-text font-mono">{app.id}</span>
                        </TableCell>
                        <TableCell>
                          <div className="table-name">
                            <Avatar name={app.business} size="sm" />
                            <div>
                              <span className="primary-text">{app.business}</span>
                              <span className="secondary-text">{app.name}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="primary-text">
                            {formatCurrency(app.amount, currentInstitution.currency)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={app.status} />
                        </TableCell>
                        <TableCell
                          className="text-right"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <LenderApplicationActionsMenu application={app} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              }
            >
              {recentApplications.map((app) => (
                <MobileDataCard
                  key={app.id}
                  href={APP_ROUTE_BUILDERS.LENDER.APPLICATION(app.id)}
                  leading={<Avatar name={app.business} size="sm" />}
                  title={app.business}
                  subtitle={`${app.id} · ${formatDate(app.submitted)}`}
                  value={formatCurrency(app.amount, currentInstitution.currency)}
                  trailing={<StatusBadge status={app.status} />}
                />
              ))}
            </ResponsiveDataList>
          )}
        </section>

        <LenderRecentActivity
          institutionId={currentInstitution.id}
          currency={currentInstitution.currency}
          institutionShort={currentInstitution.short}
        />
      </div>
    </div>
  );
}
