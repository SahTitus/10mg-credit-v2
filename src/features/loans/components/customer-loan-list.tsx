'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Eye, Search, Wallet } from 'lucide-react';
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
import { EmptyState } from '@/components/shared/empty-state';
import { QueryErrorState } from '@/components/shared/query-error-state';
import { MobileDataCard, ResponsiveDataList } from '@/components/shared/responsive-data-list';
import { useCustomerScope } from '@/features/customers/hooks/use-customer-scope';
import { loanApiService } from '@/lib/api/loan-service';
import { LOAN_STATUS_FILTERS, type LoanStatusFilter } from '@/lib/constants/application-statuses';
import { PAGINATION_DEFAULTS } from '@/lib/constants/pagination';
import { QUERY_KEYS } from '@/lib/constants/query-keys';
import { APP_ROUTE_BUILDERS } from '@/lib/constants/routes';
import { getErrorMessage } from '@/lib/errors/error-handler';
import { formatCurrency, formatDate, formatTime } from '@/lib/utils/formatters';
import { getLoanBalance, getLoanProgress } from '@/lib/utils/loan-metrics';
import { keepScopedPreviousData } from '@/lib/utils/query-helpers';
import { useDebounce } from '@/lib/utils/use-debounce';
import { usePaginationState } from '@/lib/utils/use-pagination';
import type { CurrencyCode } from '@/types/institution';

export interface CustomerLoanListProps {
  currency: CurrencyCode;
}

export function CustomerLoanList({ currency }: CustomerLoanListProps) {
  const router = useRouter();
  const { institution, customerId } = useCustomerScope();
  const [filter, setFilter] = React.useState<LoanStatusFilter>('All');
  const [search, setSearch] = React.useState('');

  const debouncedSearch = useDebounce(search);
  const [page, setPage] = usePaginationState(
    `${institution.id}:${customerId}:${filter}:${debouncedSearch}`,
  );

  const { data, isPending, isPlaceholderData, isError, error, refetch, isRefetching } = useQuery({
    queryKey: QUERY_KEYS.LOANS_PAGINATED(institution.id, customerId, filter, debouncedSearch, page),
    queryFn: () =>
      loanApiService.listPaginated({
        institutionId: institution.id,
        customerId,
        status: filter,
        search: debouncedSearch,
        page,
        pageSize: PAGINATION_DEFAULTS.PAGE_SIZE,
      }),
    placeholderData: keepScopedPreviousData(institution.id, customerId, 3),
  });

  const visible = data?.items ?? [];

  return (
    <Card className="workspace-table-card">
      <div className="workspace-table-header">
        <div className="w-full sm:w-56">
          <Select
            value={filter}
            onValueChange={(value) => {
              setFilter(value as LoanStatusFilter);
              setPage(PAGINATION_DEFAULTS.INITIAL_PAGE);
            }}
          >
            <SelectTrigger
              aria-label="Filter loan accounts by status"
              className="h-9 text-xs font-semibold"
            >
              <SelectValue placeholder="Filter loans" />
            </SelectTrigger>
            <SelectContent>
              {LOAN_STATUS_FILTERS.map((item) => (
                <SelectItem key={item} value={item}>
                  {item === 'All' ? 'All loans' : item}
                </SelectItem>
              ))}
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
        {isPending ? (
          <div className="space-y-3 p-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : isError ? (
          <QueryErrorState
            className="m-6"
            title="Unable to load loans"
            description={getErrorMessage(error, 'Could not retrieve your loan accounts.')}
            onRetry={() => {
              void refetch();
            }}
            isRetrying={isRefetching}
          />
        ) : visible.length === 0 ? (
          <EmptyState
            className="m-6"
            icon={<Wallet className="h-5 w-5" />}
            title={filter === 'All' ? 'No loans found' : `No ${filter.toLowerCase()} loans`}
            description="No financed loan accounts match your current filter or search."
          />
        ) : (
          <>
            <ResponsiveDataList
              table={
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Loan ID</TableHead>
                      <TableHead>Issued</TableHead>
                      <TableHead>Term</TableHead>
                      <TableHead>Principal</TableHead>
                      <TableHead>Outstanding</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visible.map((loan) => {
                      const progress = getLoanProgress(loan);
                      const remaining = getLoanBalance(loan);

                      return (
                        <TableRow
                          key={loan.id}
                          onClick={() => router.push(APP_ROUTE_BUILDERS.CUSTOMER.LOAN(loan.id))}
                          className="cursor-pointer transition-colors hover:bg-muted/30"
                        >
                          <TableCell>
                            <div className="flex items-center gap-2.5">
                              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-pale text-brand">
                                <Wallet className="h-3.5 w-3.5" aria-hidden="true" />
                              </span>
                              <span className="font-mono font-semibold text-foreground">
                                {loan.id}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="block font-semibold text-foreground">
                              {formatDate(loan.issued)}
                            </span>
                            <span className="block text-2xs text-muted-foreground">
                              {formatTime(loan.issued)}
                            </span>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {loan.term} months
                          </TableCell>
                          <TableCell className="font-mono font-semibold text-foreground">
                            {formatCurrency(loan.principal, currency)}
                          </TableCell>
                          <TableCell className="font-mono text-muted-foreground">
                            {formatCurrency(remaining, currency)}
                          </TableCell>
                          <TableCell>
                            <div className="w-28 space-y-1">
                              <Progress value={progress} label={`${loan.id} repayment progress`} />
                              <span className="block text-3xs text-muted-foreground">
                                {progress}% repaid
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={loan.status} />
                          </TableCell>
                          <TableCell
                            className="text-right"
                            onClick={(event) => event.stopPropagation()}
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(APP_ROUTE_BUILDERS.CUSTOMER.LOAN(loan.id))}
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
              {visible.map((loan) => {
                const progress = getLoanProgress(loan);
                const remaining = getLoanBalance(loan);

                return (
                  <MobileDataCard
                    key={loan.id}
                    href={APP_ROUTE_BUILDERS.CUSTOMER.LOAN(loan.id)}
                    leading={
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-pale text-brand">
                        <Wallet className="h-4 w-4" aria-hidden="true" />
                      </span>
                    }
                    title={loan.id}
                    subtitle={`${progress}% repaid · Issued ${formatDate(loan.issued)} · ${formatTime(loan.issued)}`}
                    value={formatCurrency(remaining, currency)}
                    trailing={<StatusBadge status={loan.status} />}
                  />
                );
              })}
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
  );
}
