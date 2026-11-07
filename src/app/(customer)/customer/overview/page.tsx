'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  Plus,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { StatusBadge } from '@/components/primitives/badge';
import { Button } from '@/components/primitives/button';
import { Card } from '@/components/primitives/card';
import { Skeleton } from '@/components/primitives/skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { KpiCard } from '@/components/shared/kpi-card';
import { QueryErrorState } from '@/components/shared/query-error-state';
import { ViewAllLink } from '@/components/shared/view-all-link';
import { CustomerHeroCarousel } from '@/features/customers/components/customer-hero-carousel';
import { useCustomerPortfolio } from '@/features/customers/hooks/use-customer-portfolio';
import { useCustomerScope } from '@/features/customers/hooks/use-customer-scope';
import { RepaymentProgressWidget } from '@/features/loans/components/repayment-progress-widget';
import { LOAN_STATUSES } from '@/lib/constants/application-statuses';
import { APP_ROUTE_BUILDERS, APP_ROUTES } from '@/lib/constants/routes';
import { formatCurrency, formatShortDate } from '@/lib/utils/formatters';

export default function CustomerOverviewPage() {
  const router = useRouter();
  const { session } = useCustomerScope();
  const portfolio = useCustomerPortfolio();
  const {
    institution,
    loans,
    applications,
    repayments,
    totals,
    isLoading,
    isError,
    errorMessage,
    retry,
    isRetrying,
  } = portfolio;
  const { currency } = institution;

  const firstName = (session?.name ?? 'Amina').split(' ')[0];

  // The progress panel follows the active loan with the nearest due date
  const activeLoan = React.useMemo(
    () =>
      [...loans]
        .filter((loan) => loan.status === LOAN_STATUSES.ACTIVE)
        .sort((a, b) => a.due.localeCompare(b.due))[0],
    [loans],
  );

  const hasWidgetData = Boolean(activeLoan);

  const recentRepaymentsCard = (
    <Card className="overflow-hidden">
      <header className="flex items-center justify-between gap-3 border-b border-line px-5 py-4 sm:px-6">
        <h2 className="text-base font-bold tracking-tight text-foreground">Recent repayments</h2>
        <ViewAllLink href={APP_ROUTES.CUSTOMER.PAYMENTS} />
      </header>

      {isLoading ? (
        <div className="space-y-3 p-5 sm:p-6">
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
      ) : repayments.length === 0 ? (
        <EmptyState
          className="m-5 min-h-37.5"
          title="No repayment history yet"
          description="Completed payments will appear here."
        />
      ) : (
        <div className="divide-y divide-line">
          {repayments.slice(0, 4).map((payment) => (
            <Link
              key={payment.id}
              href={APP_ROUTE_BUILDERS.CUSTOMER.PAYMENT(payment.id)}
              className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3 px-4 py-4 transition-colors hover:bg-muted/40 sm:flex sm:items-center sm:gap-3.5 sm:px-6"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-positive-pale text-positive">
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <strong className="block truncate text-xs font-semibold text-foreground">
                  Payment received
                </strong>
                <small className="block truncate text-2xs text-muted-foreground">
                  {formatShortDate(payment.date)} · {payment.loanId}
                </small>
              </span>
              <span className="text-right">
                <strong className="block text-xs font-bold tabular-nums text-foreground">
                  {formatCurrency(payment.amount, currency)}
                </strong>
                <small className="block text-3xs text-muted-foreground">Completed</small>
              </span>
              <ChevronRight
                className="hidden h-4 w-4 shrink-0 text-muted-foreground sm:block"
                aria-hidden="true"
              />
            </Link>
          ))}
        </div>
      )}
    </Card>
  );

  return (
    <div className="workspace-page">
      <div className="workspace-heading">
        <div>
          <h1>Hello, {firstName}</h1>
          <p>
            <span className="sm:hidden">Your credit, payments, and requests.</span>
            <span className="hidden sm:inline">
              Your credit, payments, and applications in one place.
            </span>
          </p>
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

      <CustomerHeroCarousel institution={institution} />

      {isError ? (
        <Card className="p-4 sm:p-6">
          <QueryErrorState
            title="Unable to load portfolio"
            description={errorMessage}
            onRetry={retry}
            isRetrying={isRetrying}
          />
        </Card>
      ) : (
        <>
          <div className="workspace-kpi-grid">
            <KpiCard
              label="Active credit"
              value={formatCurrency(totals.principal, currency, true)}
              note={`From ${loans.length} funded ${loans.length === 1 ? 'loan' : 'loans'}`}
              icon={<TrendingUp className="h-4 w-4" />}
              tone="blue"
              sparklineIndex={0}
              isLoading={isLoading}
            />
            <KpiCard
              label="Outstanding"
              value={formatCurrency(totals.outstanding, currency, true)}
              note="Remaining to be repaid"
              icon={<Clock className="h-4 w-4" />}
              tone="orange"
              sparklineIndex={1}
              isLoading={isLoading}
            />
            <KpiCard
              label="Paid to date"
              value={formatCurrency(totals.repaid, currency, true)}
              note="Across all repayments"
              icon={<CheckCircle2 className="h-4 w-4" />}
              tone="green"
              sparklineIndex={2}
              isLoading={isLoading}
            />
            <KpiCard
              label="Credit requests"
              value={applications.length}
              note={`${totals.activeCount} active facilities`}
              icon={<Wallet className="h-4 w-4" />}
              tone="violet"
              sparklineIndex={3}
              isLoading={isLoading}
            />
          </div>

          {hasWidgetData && (
            <div className="lg:hidden">
              <RepaymentProgressWidget
                activeLoan={activeLoan}
                currency={currency}
                isLoading={isLoading}
              />
            </div>
          )}

          <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.28fr)_minmax(310px,0.82fr)]">
            <div className="space-y-5">
              <Card className="overflow-hidden">
                <header className="flex items-center justify-between gap-3 border-b border-line px-5 py-4 sm:px-6">
                  <h2 className="text-base font-bold tracking-tight text-foreground">
                    Credit activity
                  </h2>
                  <ViewAllLink href={APP_ROUTES.CUSTOMER.APPLICATIONS} />
                </header>

                {isLoading ? (
                  <div className="space-y-3 p-5 sm:p-6">
                    <Skeleton className="h-12 w-full rounded-lg" />
                    <Skeleton className="h-12 w-full rounded-lg" />
                  </div>
                ) : applications.length === 0 ? (
                  <EmptyState
                    className="m-5 min-h-37.5"
                    title="No applications yet"
                    description="Submitted credit requests will appear here."
                  />
                ) : (
                  <div className="divide-y divide-line">
                    {applications.slice(0, 4).map((application) => (
                      <Link
                        key={application.id}
                        href={APP_ROUTE_BUILDERS.CUSTOMER.APPLICATION(application.id)}
                        className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3 px-4 py-4 transition-colors hover:bg-muted/40 sm:flex sm:items-center sm:gap-3.5 sm:px-6"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-pale text-violet">
                          <FileText className="h-4 w-4" aria-hidden="true" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <strong className="block truncate text-xs font-semibold text-foreground">
                            {application.purpose}
                          </strong>
                          <small className="block truncate text-2xs text-muted-foreground">
                            {application.id} · {formatShortDate(application.submitted)}
                          </small>
                        </span>
                        <span className="flex flex-col items-end gap-1.5 text-right">
                          <strong className="text-xs font-bold tabular-nums text-foreground">
                            {formatCurrency(application.amount, currency)}
                          </strong>
                          <StatusBadge status={application.status} />
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </Card>

              {hasWidgetData && recentRepaymentsCard}
            </div>

            <aside
              className="hidden space-y-5 lg:block"
              aria-label="Repayments and facility progress"
            >
              {hasWidgetData ? (
                <RepaymentProgressWidget
                  activeLoan={activeLoan}
                  currency={currency}
                  isLoading={isLoading}
                />
              ) : (
                recentRepaymentsCard
              )}
            </aside>
          </div>
        </>
      )}
    </div>
  );
}
