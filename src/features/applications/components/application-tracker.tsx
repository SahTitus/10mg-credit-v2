'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Eye, FileText, MoreHorizontal, Search, Trash2 } from 'lucide-react';
import { StatusBadge } from '@/components/primitives/badge';
import { Button } from '@/components/primitives/button';
import { Card, CardContent } from '@/components/primitives/card';
import { ConfirmDialog } from '@/components/primitives/confirm-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/primitives/dropdown-menu';
import { Input } from '@/components/primitives/input';
import { Pagination } from '@/components/primitives/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/primitives/select';
import { Skeleton } from '@/components/primitives/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/primitives/table';
import { useToast } from '@/components/primitives/toast';
import { EmptyState } from '@/components/shared/empty-state';
import { QueryErrorState } from '@/components/shared/query-error-state';
import { MobileDataCard, ResponsiveDataList } from '@/components/shared/responsive-data-list';
import { useCustomerScope } from '@/features/customers/hooks/use-customer-scope';
import { applicationApiService } from '@/lib/api/application-service';
import {
  APPLICATION_STATUSES,
  APPLICATION_STATUS_FILTERS,
  type ApplicationStatusFilter,
} from '@/lib/constants/application-statuses';
import { PAGINATION_DEFAULTS } from '@/lib/constants/pagination';
import { QUERY_KEYS } from '@/lib/constants/query-keys';
import { APP_ROUTE_BUILDERS } from '@/lib/constants/routes';
import { getErrorMessage } from '@/lib/errors/error-handler';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import { keepScopedPreviousData } from '@/lib/utils/query-helpers';
import { invalidateAfterApplicationWithdrawn } from '@/lib/utils/query-invalidation';
import { useDebounce } from '@/lib/utils/use-debounce';
import { usePaginationState } from '@/lib/utils/use-pagination';
import type { LoanApplication } from '@/types/application';
import type { CurrencyCode } from '@/types/institution';

export interface ApplicationTrackerProps {
  currency: CurrencyCode;
}

export function ApplicationTracker({ currency }: ApplicationTrackerProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast, error: toastError } = useToast();
  const { institution, customerId } = useCustomerScope();
  const [statusFilter, setStatusFilter] = React.useState<ApplicationStatusFilter>('All');
  const [search, setSearch] = React.useState('');
  const [pendingWithdrawApp, setPendingWithdrawApp] = React.useState<LoanApplication | null>(null);

  const debouncedSearch = useDebounce(search);
  const [page, setPage] = usePaginationState(
    `${institution.id}:${customerId}:${statusFilter}:${debouncedSearch}`,
  );

  const { data, isPending, isPlaceholderData, isError, error, refetch, isRefetching } = useQuery({
    queryKey: QUERY_KEYS.APPLICATIONS_PAGINATED(
      institution.id,
      statusFilter,
      debouncedSearch,
      page,
      customerId,
    ),
    queryFn: () =>
      applicationApiService.listPaginated({
        institutionId: institution.id,
        customerId,
        status: statusFilter,
        search: debouncedSearch,
        page,
        pageSize: PAGINATION_DEFAULTS.PAGE_SIZE,
      }),
    placeholderData: keepScopedPreviousData(institution.id, customerId, 6),
  });

  const withdrawMutation = useMutation({
    mutationFn: (applicationId: string) =>
      applicationApiService.withdraw(applicationId, {
        institutionId: institution.id,
        customerId,
      }),
    onSuccess: (_, applicationId) => {
      setPendingWithdrawApp(null);
      invalidateAfterApplicationWithdrawn(queryClient, {
        institutionId: institution.id,
        applicationId,
        customerId,
      });
      toast('Application withdrawn', `Request #${applicationId} has been withdrawn`, 'info');
    },
    onError: (err) => {
      toastError(
        'Could not withdraw',
        err instanceof Error ? err.message : 'Unable to withdraw application',
      );
    },
  });

  const items = data?.items ?? [];
  const totalCount = data?.totalCount ?? 0;

  return (
    <Card className="workspace-table-card">
      <div className="workspace-table-header">
        <div className="w-full sm:w-56">
          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value as ApplicationStatusFilter);
              setPage(PAGINATION_DEFAULTS.INITIAL_PAGE);
            }}
          >
            <SelectTrigger
              aria-label="Filter applications by status"
              className="h-9 text-xs font-semibold"
            >
              <SelectValue placeholder="Filter applications" />
            </SelectTrigger>
            <SelectContent>
              {APPLICATION_STATUS_FILTERS.map((status) => (
                <SelectItem key={status} value={status}>
                  {status === 'All' ? 'All applications' : status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-full sm:w-64">
          <Input
            type="search"
            placeholder="Search applications..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            prefixIcon={<Search className="h-3.5 w-3.5" />}
            className="h-9 text-xs"
          />
        </div>
      </div>

      <CardContent className={isPlaceholderData ? 'p-0 opacity-65 transition-opacity' : 'p-0'}>
        {isPending ? (
          <div className="space-y-3 p-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : isError ? (
          <QueryErrorState
            className="m-6"
            title="Unable to load applications"
            description={getErrorMessage(error, 'Could not retrieve your applications.')}
            onRetry={() => {
              void refetch();
            }}
            isRetrying={isRefetching}
          />
        ) : items.length === 0 ? (
          <EmptyState
            className="m-6"
            title="No applications found"
            description="No credit applications match your current filter or search."
          />
        ) : (
          <>
            <ResponsiveDataList
              table={
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reference</TableHead>
                      <TableHead>Purpose</TableHead>
                      <TableHead>Term</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((application) => {
                      const canWithdraw = application.status === APPLICATION_STATUSES.PENDING;
                      const isInReview = application.status === APPLICATION_STATUSES.IN_REVIEW;

                      return (
                        <TableRow
                          key={application.id}
                          onClick={() =>
                            router.push(APP_ROUTE_BUILDERS.CUSTOMER.APPLICATION(application.id))
                          }
                          className="cursor-pointer transition-colors hover:bg-muted/30"
                        >
                          <TableCell className="font-mono font-semibold text-foreground">
                            {application.id}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2.5">
                              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-pale text-violet">
                                <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                              </span>
                              <span className="font-semibold text-foreground">
                                {application.purpose}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {application.term} months
                          </TableCell>
                          <TableCell className="font-mono font-semibold text-foreground">
                            {formatCurrency(application.amount, currency)}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDate(application.submitted)}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={application.status} />
                          </TableCell>
                          <TableCell
                            className="text-right"
                            onClick={(event) => event.stopPropagation()}
                          >
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8 rounded-lg border-border bg-card text-muted-foreground shadow-2xs hover:border-brand/40 hover:bg-muted/50 hover:text-foreground"
                                  aria-label={`Actions for ${application.id}`}
                                >
                                  <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="min-w-44">
                                <DropdownMenuItem
                                  onSelect={() =>
                                    router.push(
                                      APP_ROUTE_BUILDERS.CUSTOMER.APPLICATION(application.id),
                                    )
                                  }
                                >
                                  <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                                  <span>View details</span>
                                </DropdownMenuItem>

                                {(canWithdraw || isInReview) && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      disabled={!canWithdraw || withdrawMutation.isPending}
                                      onSelect={() => {
                                        if (canWithdraw) {
                                          setPendingWithdrawApp(application);
                                        }
                                      }}
                                      className="text-destructive data-disabled:pointer-events-none data-disabled:opacity-45 data-highlighted:bg-destructive/10 data-highlighted:text-destructive"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                                      <span>
                                        {isInReview
                                          ? 'Withdraw (under review)'
                                          : 'Withdraw application'}
                                      </span>
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              }
            >
              {items.map((application) => (
                <MobileDataCard
                  key={application.id}
                  href={APP_ROUTE_BUILDERS.CUSTOMER.APPLICATION(application.id)}
                  leading={
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-pale text-violet">
                      <FileText className="h-4 w-4" aria-hidden="true" />
                    </span>
                  }
                  title={application.purpose}
                  subtitle={`${application.id} · ${formatDate(application.submitted)}`}
                  value={formatCurrency(application.amount, currency)}
                  trailing={<StatusBadge status={application.status} />}
                />
              ))}
            </ResponsiveDataList>

            <Pagination
              currentPage={data?.currentPage ?? page}
              totalPages={data?.totalPages ?? 1}
              totalCount={totalCount}
              startIndex={data?.startIndex ?? 0}
              endIndex={data?.endIndex ?? 0}
              onPageChange={setPage}
              itemLabel="applications"
            />
          </>
        )}
      </CardContent>

      <ConfirmDialog
        open={pendingWithdrawApp !== null}
        onOpenChange={(open) => {
          if (!open) setPendingWithdrawApp(null);
        }}
        title="Withdraw credit application"
        description={
          pendingWithdrawApp
            ? `Are you sure you want to withdraw request #${pendingWithdrawApp.id} (${formatCurrency(pendingWithdrawApp.amount, currency)} for ${pendingWithdrawApp.purpose})? This action cannot be undone.`
            : ''
        }
        confirmLabel="Withdraw application"
        tone="danger"
        isLoading={withdrawMutation.isPending}
        onConfirm={() => {
          if (pendingWithdrawApp) {
            withdrawMutation.mutate(pendingWithdrawApp.id);
          }
        }}
      />
    </Card>
  );
}
