'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Clock, Download, Eye, Percent, Search, Wallet } from 'lucide-react';
import { Avatar } from '@/components/primitives/avatar';
import { StatusBadge } from '@/components/primitives/badge';
import { Button } from '@/components/primitives/button';
import { Card, CardContent } from '@/components/primitives/card';
import { Input } from '@/components/primitives/input';
import { Pagination } from '@/components/primitives/pagination';
import { Progress } from '@/components/primitives/progress';
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
import { KpiCard } from '@/components/shared/kpi-card';
import { QueryErrorState } from '@/components/shared/query-error-state';
import { MobileDataCard, ResponsiveDataList } from '@/components/shared/responsive-data-list';
import { loanApiService } from '@/lib/api/loan-service';
import { LOAN_STATUSES } from '@/lib/constants/application-statuses';
import { PAGINATION_DEFAULTS } from '@/lib/constants/pagination';
import { QUERY_KEYS } from '@/lib/constants/query-keys';
import { APP_ROUTE_BUILDERS } from '@/lib/constants/routes';
import { getErrorMessage } from '@/lib/errors/error-handler';
import { clamp, formatCurrency } from '@/lib/utils/formatters';
import { keepScopedPreviousData } from '@/lib/utils/query-helpers';
import { useDebounce } from '@/lib/utils/use-debounce';
import { usePaginationState } from '@/lib/utils/use-pagination';
import { useInstitutionStore } from '@/store/institution-store';
import type { Loan } from '@/types/loan';

export default function LoansPage() {
  const router = useRouter();
  const currentInstitution = useInstitutionStore((s) => s.currentInstitution);
  const { toast } = useToast();
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<'ALL' | Loan['status']>('ALL');

  const debouncedSearch = useDebounce(search);
  const [page, setPage] = usePaginationState(
    `${currentInstitution.id}:${statusFilter}:${debouncedSearch}`,
  );

  const { data, isPending, isPlaceholderData, isError, error, refetch, isRefetching } = useQuery({
    queryKey: QUERY_KEYS.LOANS_PAGINATED(
      currentInstitution.id,
      undefined,
      statusFilter,
      debouncedSearch,
      page,
    ),
    queryFn: () =>
      loanApiService.listPaginated({
        institutionId: currentInstitution.id,
        status: statusFilter,
        search: debouncedSearch,
        page,
        pageSize: PAGINATION_DEFAULTS.PAGE_SIZE,
      }),
    placeholderData: keepScopedPreviousData(currentInstitution.id),
  });

  const summary = data?.summary;
  const items = data?.items ?? [];
  const isInitialLoading = isPending;
  const isTableLoading = isPending;

  const handleExportCSV = async () => {
    // Export all matching loans, including records outside the current table page
    const exported = await loanApiService.list(currentInstitution.id, undefined, debouncedSearch);
    const filtered =
      statusFilter === 'ALL' ? exported : exported.filter((l) => l.status === statusFilter);
    const headers = ['ID,Borrower,Business,Principal,TotalDue,Paid,Term,Issued,Due,Status\n'];
    const rows = filtered.map(
      (l) =>
        `"${l.id}","${l.borrower}","${l.business}","${l.principal}","${l.totalDue}","${l.paid}","${l.term}","${l.issued}","${l.due}","${l.status}"\n`,
    );
    const blob = new Blob([...headers, ...rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentInstitution.short}-loans-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    toast('Export Complete', 'Loans portfolio downloaded as CSV', 'info');
  };

  return (
    <div className="workspace-page">
      <div className="workspace-heading">
        <div>
          <h1>Loan portfolio</h1>
          <p>
            <span className="sm:hidden">Funded loans and repayment performance.</span>
            <span className="hidden sm:inline">
              Stay on top of funded loans and repayment performance across{' '}
              {currentInstitution.short}.
            </span>
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleExportCSV}
          className="self-end shrink-0 sm:self-auto"
        >
          <Download className="h-4 w-4" />
          <span>Export</span>
        </Button>
      </div>

      <div className="workspace-kpi-grid">
        <KpiCard
          label="Active loans"
          value={summary?.activeCount ?? 0}
          note={`${summary?.totalCount ?? 0} funded to date`}
          icon={<Wallet className="h-4 w-4" />}
          tone="blue"
          sparklineIndex={0}
          isLoading={isInitialLoading}
        />
        <KpiCard
          label="Outstanding balance"
          value={formatCurrency(
            summary?.outstandingBalance ?? 0,
            currentInstitution.currency,
            true,
          )}
          note="Amount left to collect"
          icon={<Clock className="h-4 w-4" />}
          tone="orange"
          sparklineIndex={1}
          isLoading={isInitialLoading}
        />
        <KpiCard
          label="Total collected"
          value={formatCurrency(summary?.totalCollected ?? 0, currentInstitution.currency, true)}
          note="Across funded loans"
          icon={<CheckCircle2 className="h-4 w-4" />}
          tone="green"
          sparklineIndex={2}
          isLoading={isInitialLoading}
        />
        <KpiCard
          label="Completed loans"
          value={summary?.completedCount ?? 0}
          note={`${summary?.repaymentRate ?? 0}% portfolio repaid`}
          icon={<Percent className="h-4 w-4" />}
          tone="violet"
          sparklineIndex={3}
          isLoading={isInitialLoading}
        />
      </div>

      <Card className="workspace-table-card">
        <div className="workspace-table-header">
          <div className="w-full sm:w-56">
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value as 'ALL' | Loan['status']);
                setPage(PAGINATION_DEFAULTS.INITIAL_PAGE);
              }}
            >
              <SelectTrigger
                aria-label="Filter loans by status"
                className="h-9 text-xs font-semibold"
              >
                <SelectValue placeholder="Filter loans" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All loans</SelectItem>
                <SelectItem value={LOAN_STATUSES.ACTIVE}>{LOAN_STATUSES.ACTIVE}</SelectItem>
                <SelectItem value={LOAN_STATUSES.COMPLETED}>{LOAN_STATUSES.COMPLETED}</SelectItem>
                {(summary?.overdueCount ?? 0) > 0 && (
                  <SelectItem value={LOAN_STATUSES.OVERDUE}>{LOAN_STATUSES.OVERDUE}</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="w-full sm:w-64">
            <Input
              type="search"
              placeholder="Search loans..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              prefixIcon={<Search className="h-3.5 w-3.5" />}
              className="h-9 text-xs"
            />
          </div>
        </div>

        <CardContent className={isPlaceholderData ? 'p-0 opacity-65 transition-opacity' : 'p-0'}>
          {isTableLoading ? (
            <div className="space-y-3 p-6">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : isError ? (
            <QueryErrorState
              className="m-6"
              title="Unable to load loans"
              description={getErrorMessage(error, 'Could not retrieve loan portfolio records.')}
              onRetry={() => {
                void refetch();
              }}
              isRetrying={isRefetching}
            />
          ) : items.length === 0 ? (
            <EmptyState
              title="No loans found"
              description="No loans match your search criteria."
              className="m-6"
            />
          ) : (
            <>
              <ResponsiveDataList
                table={
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Loan ID</TableHead>
                        <TableHead>Borrower</TableHead>
                        <TableHead>Principal</TableHead>
                        <TableHead>Outstanding</TableHead>
                        <TableHead>Progress</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((l) => {
                        const pct = clamp(Math.round((l.paid / l.totalDue) * 100), 0, 100);
                        const remaining = Math.max(0, l.totalDue - l.paid);
                        return (
                          <TableRow
                            key={l.id}
                            onClick={() => router.push(APP_ROUTE_BUILDERS.LENDER.LOAN(l.id))}
                            className="cursor-pointer transition-colors hover:bg-muted/30"
                          >
                            <TableCell className="font-mono font-semibold text-foreground">
                              {l.id}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2.5">
                                <Avatar name={l.business} size="sm" />
                                <div>
                                  <span className="block font-semibold text-foreground">
                                    {l.business}
                                  </span>
                                  <span className="block text-2xs text-muted-foreground">
                                    {l.borrower}
                                  </span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="font-mono font-semibold text-foreground">
                              {formatCurrency(l.principal, currentInstitution.currency)}
                            </TableCell>
                            <TableCell className="font-mono text-muted-foreground">
                              {formatCurrency(remaining, currentInstitution.currency)}
                            </TableCell>
                            <TableCell>
                              <div className="w-28 space-y-1">
                                <Progress value={pct} label={`${l.id} repayment progress`} />
                                <span className="block text-3xs text-muted-foreground">
                                  {pct}% repaid
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <StatusBadge status={l.status} />
                            </TableCell>
                            <TableCell
                              className="text-right"
                              onClick={(event) => event.stopPropagation()}
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.push(APP_ROUTE_BUILDERS.LENDER.LOAN(l.id))}
                                className="h-7.5 gap-1.5 px-2.5 text-xs font-semibold"
                              >
                                <span>View</span>
                                <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                }
              >
                {items.map((loan) => (
                  <MobileDataCard
                    key={loan.id}
                    href={APP_ROUTE_BUILDERS.LENDER.LOAN(loan.id)}
                    leading={<Avatar name={loan.business} size="sm" />}
                    title={loan.business}
                    subtitle={`${loan.id} · ${clamp(Math.round((loan.paid / loan.totalDue) * 100), 0, 100)}% repaid`}
                    value={formatCurrency(loan.principal, currentInstitution.currency)}
                    trailing={<StatusBadge status={loan.status} />}
                  />
                ))}
              </ResponsiveDataList>

              <Pagination
                currentPage={data?.currentPage ?? page}
                totalPages={data?.totalPages ?? 1}
                totalCount={data?.totalCount ?? 0}
                startIndex={data?.startIndex ?? 0}
                endIndex={data?.endIndex ?? 0}
                onPageChange={setPage}
                itemLabel="loans"
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
