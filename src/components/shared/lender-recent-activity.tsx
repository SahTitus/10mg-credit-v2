'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ArrowUpRight, CheckCircle2, Clock, FileText, Wallet } from 'lucide-react';
import { StatusBadge } from '@/components/primitives/badge';
import { Button } from '@/components/primitives/button';
import { Drawer } from '@/components/primitives/drawer';
import { Skeleton } from '@/components/primitives/skeleton';
import { QueryErrorState } from '@/components/shared/query-error-state';
import { dashboardApiService } from '@/lib/api/dashboard-service';
import { APPLICATION_STATUSES } from '@/lib/constants/application-statuses';
import { QUERY_KEYS } from '@/lib/constants/query-keys';
import { getErrorMessage } from '@/lib/errors/error-handler';
import { cn } from '@/lib/utils/cn';
import { formatCurrency, formatDate, formatShortDate } from '@/lib/utils/formatters';
import { keepScopedPreviousData } from '@/lib/utils/query-helpers';
import type { LenderActivityCategory } from '@/types/dashboard';
import type { CurrencyCode } from '@/types/institution';

export interface LenderRecentActivityProps {
  institutionId: string;
  currency: CurrencyCode;
  institutionShort: string;
}

const PREVIEW_LIMIT = 5;

const FILTER_TABS: ReadonlyArray<{ key: LenderActivityCategory; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'application', label: 'Applications' },
  { key: 'loan', label: 'Loans' },
  { key: 'repayment', label: 'Repayments' },
];

function ActivityIcon({
  category,
  status,
}: {
  category: Exclude<LenderActivityCategory, 'all'>;
  status: string;
}) {
  if (category === 'repayment') {
    return (
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-positive-pale text-positive">
        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
      </span>
    );
  }

  if (category === 'loan') {
    return (
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-pale text-brand">
        <Wallet className="h-4 w-4" aria-hidden="true" />
      </span>
    );
  }

  const isPending =
    status === APPLICATION_STATUSES.PENDING || status === APPLICATION_STATUSES.IN_REVIEW;

  return (
    <span
      className={cn(
        'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
        isPending ? 'bg-warning-pale text-warning' : 'bg-violet-pale text-violet',
      )}
    >
      {isPending ? (
        <Clock className="h-4 w-4" aria-hidden="true" />
      ) : (
        <FileText className="h-4 w-4" aria-hidden="true" />
      )}
    </span>
  );
}

export function LenderRecentActivity({
  institutionId,
  currency,
  institutionShort,
}: LenderRecentActivityProps) {
  const router = useRouter();
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [activeFilter, setActiveFilter] = React.useState<LenderActivityCategory>('all');

  const {
    data: recentData,
    isPending: isRecentLoading,
    isError: isRecentError,
    error: recentError,
    refetch: refetchRecent,
    isRefetching: isRecentRefetching,
  } = useQuery({
    queryKey: QUERY_KEYS.LENDER_RECENT_ACTIVITIES(institutionId, PREVIEW_LIMIT),
    queryFn: () => dashboardApiService.getLenderActivities(institutionId, { limit: PREVIEW_LIMIT }),
  });

  const {
    data: drawerData,
    isPending: isDrawerLoading,
    isError: isDrawerError,
    error: drawerError,
    refetch: refetchDrawer,
    isRefetching: isDrawerRefetching,
  } = useQuery({
    queryKey: QUERY_KEYS.LENDER_ALL_ACTIVITIES(institutionId, activeFilter),
    queryFn: () =>
      dashboardApiService.getLenderActivities(institutionId, { category: activeFilter }),
    enabled: isDrawerOpen,
    placeholderData: keepScopedPreviousData(institutionId),
  });

  const previewItems = recentData?.items ?? [];
  const totalCount = drawerData?.totalCount ?? recentData?.totalCount ?? 0;
  const drawerItems = drawerData?.items ?? [];

  return (
    <>
      <aside className="card data-card min-w-0" aria-label="Recent activity">
        <div className="data-card-header">
          <div>
            <h2>Recent activity</h2>
            <p>Latest portfolio events</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsDrawerOpen(true)}
            className="text-arrow h-auto px-0 py-0 text-xs font-bold text-brand hover:bg-transparent hover:underline"
          >
            <span>View all</span>
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Button>
        </div>

        {isRecentLoading ? (
          <div className="space-y-3 p-5">
            {[1, 2, 3, 4].map((n) => (
              <Skeleton key={n} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        ) : isRecentError ? (
          <QueryErrorState
            className="m-5"
            title="Unable to load activity"
            description={getErrorMessage(recentError, 'Could not load portfolio activity.')}
            onRetry={() => {
              void refetchRecent();
            }}
            isRetrying={isRecentRefetching}
          />
        ) : previewItems.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground">
            No recent portfolio activity.
          </div>
        ) : (
          <div className="divide-y divide-line border-t border-line">
            {previewItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="flex items-center justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-[#fafcff]"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <ActivityIcon category={item.category} status={item.status} />
                  <div className="min-w-0">
                    <strong className="block truncate text-xs font-semibold text-foreground">
                      {item.title}
                    </strong>
                    <span className="mt-0.5 block truncate text-2xs text-muted-foreground">
                      {item.business} · <span className="font-mono">{item.referenceId}</span>
                    </span>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <strong className="block font-mono text-xs font-semibold text-foreground">
                    {formatCurrency(item.amount, currency)}
                  </strong>
                  <span className="mt-0.5 block text-3xs text-muted-foreground">
                    {formatShortDate(item.date)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </aside>

      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Recent activity"
        description={`Portfolio events across ${institutionShort}`}
        titleAdornment={
          <span className="ml-2 inline-flex rounded-md bg-brand-pale px-2 py-0.5 align-middle text-xs font-semibold tracking-normal text-brand">
            {totalCount}
          </span>
        }
        width="max-w-115"
        contentClassName="p-0"
      >
        <div className="flex items-center gap-1.5 overflow-x-auto border-b border-line px-6 py-3.5">
          {FILTER_TABS.map((tab) => (
            <Button
              key={tab.key}
              type="button"
              variant={activeFilter === tab.key ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveFilter(tab.key)}
              className="h-7 px-2.5 text-xs"
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {isDrawerLoading && drawerItems.length === 0 ? (
          <div className="space-y-3 p-6">
            {[1, 2, 3, 4, 5].map((n) => (
              <Skeleton key={n} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        ) : isDrawerError ? (
          <QueryErrorState
            className="m-6"
            title="Unable to load activity"
            description={getErrorMessage(drawerError, 'Could not load portfolio activity.')}
            onRetry={() => {
              void refetchDrawer();
            }}
            isRetrying={isDrawerRefetching}
          />
        ) : drawerItems.length === 0 ? (
          <div className="py-12 text-center text-xs text-muted-foreground">
            No matching activity records.
          </div>
        ) : (
          <div className="divide-y divide-line">
            {drawerItems.map((item) => (
              <Button
                key={item.id}
                type="button"
                variant="ghost"
                onClick={() => {
                  setIsDrawerOpen(false);
                  router.push(item.href);
                }}
                className="h-auto w-full items-center justify-between gap-3.5 rounded-none px-6 py-4 text-left whitespace-normal hover:bg-[#fafcff]"
              >
                <span className="flex min-w-0 items-center gap-3">
                  <ActivityIcon category={item.category} status={item.status} />
                  <span className="min-w-0">
                    <strong className="block truncate text-xs font-semibold text-foreground">
                      {item.title}
                    </strong>
                    <span className="mt-0.5 block truncate text-2xs text-muted-foreground">
                      {item.business} · <span className="font-mono">{item.referenceId}</span>
                    </span>
                    <span className="mt-1 block text-3xs text-muted-foreground">
                      {formatDate(item.date)}
                    </span>
                  </span>
                </span>
                <span className="flex shrink-0 flex-col items-end gap-1.5 text-right">
                  <strong className="font-mono text-xs font-bold text-foreground">
                    {formatCurrency(item.amount, currency)}
                  </strong>
                  <StatusBadge status={item.status} />
                </span>
              </Button>
            ))}
          </div>
        )}
      </Drawer>
    </>
  );
}
