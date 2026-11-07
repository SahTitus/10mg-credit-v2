'use client';

import Link from 'next/link';
import { FileText, Wallet } from 'lucide-react';
import { Avatar } from '@/components/primitives/avatar';
import { StatusBadge } from '@/components/primitives/badge';
import { Card } from '@/components/primitives/card';
import { DetailList } from '@/components/shared/detail-list';
import { QueryErrorState } from '@/components/shared/query-error-state';
import { RecordHeader } from '@/components/shared/record-header';
import { RecordNotFound } from '@/components/shared/record-not-found';
import { Skeleton } from '@/components/primitives/skeleton';
import { useLenderCustomerDetail } from '@/features/customers/hooks/use-lender-customer-detail';
import { APP_ROUTE_BUILDERS, APP_ROUTES } from '@/lib/constants/routes';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';

export default function LenderCustomerDetailPage() {
  const { customer, institution, isLoading, isError, errorMessage, retry, isRetrying, isMissing } =
    useLenderCustomerDetail();
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
        title="Unable to load customer"
        description={errorMessage}
        onRetry={retry}
        isRetrying={isRetrying}
        backHref={APP_ROUTES.LENDER.CUSTOMERS}
        backLabel="Customers"
      />
    );
  if (isMissing || !customer)
    return <RecordNotFound backHref={APP_ROUTES.LENDER.CUSTOMERS} backLabel="Customers" />;
  return (
    <div className="workspace-page">
      <RecordHeader
        backHref={APP_ROUTES.LENDER.CUSTOMERS}
        backLabel="Customers"
        overline={customer.id}
        title={customer.business}
        subtitle={`${customer.name} · Joined ${formatDate(customer.joined)}`}
        status={
          <span className="inline-flex items-center rounded-full bg-brand-pale px-2.5 py-0.5 text-[11px] leading-4 font-bold text-brand sm:text-3xs">
            Score {customer.score}
          </span>
        }
      />
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.65fr)_minmax(280px,1fr)]">
        <div className="space-y-5">
          <Card className="p-5 sm:p-6">
            <h2 className="text-base font-bold tracking-tight text-foreground">Customer profile</h2>
            <div className="mt-4 flex items-center gap-3 rounded-xl border border-line bg-muted/30 p-3.5">
              <Avatar name={customer.business} size="md" />
              <div className="min-w-0">
                <strong className="block truncate text-xs font-bold text-foreground">
                  {customer.business}
                </strong>
                <small className="block truncate text-2xs text-muted-foreground">
                  {customer.name}
                </small>
              </div>
            </div>
            <DetailList
              className="mt-4"
              rows={[
                { label: 'Email', value: customer.email },
                { label: 'Phone', value: customer.phone },
                { label: 'Location', value: customer.location || '—' },
                { label: 'Account opened', value: formatDate(customer.joined) },
              ]}
            />
          </Card>
          <Card className="overflow-hidden">
            <header className="flex items-center gap-2 border-b border-line px-5 py-4">
              <Wallet className="h-4 w-4 text-brand" />
              <h2 className="text-base font-bold text-foreground">Loan accounts</h2>
            </header>
            <div className="divide-y divide-line">
              {customer.loans.map((loan) => (
                <Link
                  key={loan.id}
                  href={APP_ROUTE_BUILDERS.LENDER.LOAN(loan.id)}
                  className="flex items-center justify-between gap-3 px-5 py-3 text-xs transition-colors hover:bg-muted/50"
                >
                  <span>
                    <strong className="block font-mono text-foreground">{loan.id}</strong>
                    <small className="text-2xs text-muted-foreground">
                      Due {formatDate(loan.due)}
                    </small>
                  </span>
                  <span className="text-right">
                    <strong className="block tabular-nums text-foreground">
                      {formatCurrency(loan.principal, institution.currency)}
                    </strong>
                    <StatusBadge status={loan.status} />
                  </span>
                </Link>
              ))}
            </div>
          </Card>
        </div>
        <aside>
          <Card className="overflow-hidden">
            <header className="flex items-center gap-2 border-b border-line px-5 py-4">
              <FileText className="h-4 w-4 text-brand" />
              <h2 className="text-sm font-bold text-foreground">Applications</h2>
            </header>
            <div className="divide-y divide-line">
              {customer.applications.map((application) => (
                <Link
                  key={application.id}
                  href={APP_ROUTE_BUILDERS.LENDER.APPLICATION(application.id)}
                  className="flex items-center justify-between gap-3 px-5 py-3 text-xs transition-colors hover:bg-muted/50"
                >
                  <span>
                    <strong className="block font-mono text-foreground">{application.id}</strong>
                    <small className="text-2xs text-muted-foreground">{application.purpose}</small>
                  </span>
                  <StatusBadge status={application.status} />
                </Link>
              ))}
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
