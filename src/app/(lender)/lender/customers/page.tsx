'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Award, Eye, Search, TrendingUp, Users, Wallet } from 'lucide-react';
import { Avatar } from '@/components/primitives/avatar';
import { Button } from '@/components/primitives/button';
import { Card, CardContent } from '@/components/primitives/card';
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
import { EmptyState } from '@/components/shared/empty-state';
import { KpiCard } from '@/components/shared/kpi-card';
import { QueryErrorState } from '@/components/shared/query-error-state';
import { MobileDataCard, ResponsiveDataList } from '@/components/shared/responsive-data-list';
import { customerApiService, type CustomerDirectoryFilter } from '@/lib/api/customer-service';
import { PAGINATION_DEFAULTS } from '@/lib/constants/pagination';
import { QUERY_KEYS } from '@/lib/constants/query-keys';
import { APP_ROUTE_BUILDERS } from '@/lib/constants/routes';
import { getErrorMessage } from '@/lib/errors/error-handler';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import { keepScopedPreviousData } from '@/lib/utils/query-helpers';
import { useDebounce } from '@/lib/utils/use-debounce';
import { usePaginationState } from '@/lib/utils/use-pagination';
import { useInstitutionStore } from '@/store/institution-store';

export default function CustomersPage() {
  const router = useRouter();
  const currentInstitution = useInstitutionStore((s) => s.currentInstitution);
  const [search, setSearch] = React.useState('');
  const [customerFilter, setCustomerFilter] = React.useState<CustomerDirectoryFilter>('ALL');

  const debouncedSearch = useDebounce(search);
  const [page, setPage] = usePaginationState(
    `${currentInstitution.id}:${customerFilter}:${debouncedSearch}`,
  );

  const { data, isPending, isPlaceholderData, isError, error, refetch, isRefetching } = useQuery({
    queryKey: QUERY_KEYS.CUSTOMERS_PAGINATED(
      currentInstitution.id,
      customerFilter,
      debouncedSearch,
      page,
    ),
    queryFn: () =>
      customerApiService.listPaginated({
        institutionId: currentInstitution.id,
        filter: customerFilter,
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

  return (
    <div className="workspace-page">
      <div className="workspace-heading">
        <div>
          <h1>Customers</h1>
          <p>
            <span className="sm:hidden">Businesses and professionals you finance.</span>
            <span className="hidden sm:inline">
              A complete view of the healthcare businesses and professionals you finance.
            </span>
          </p>
        </div>
      </div>

      <div className="workspace-kpi-grid">
        <KpiCard
          label="Total customers"
          value={summary?.totalCustomers ?? 0}
          note="Registered accounts"
          icon={<Users className="h-4 w-4" />}
          tone="blue"
          sparklineIndex={0}
          isLoading={isInitialLoading}
        />
        <KpiCard
          label="Active borrowers"
          value={summary?.activeBorrowersCount ?? 0}
          note="Currently financed"
          icon={<Wallet className="h-4 w-4" />}
          tone="green"
          sparklineIndex={1}
          isLoading={isInitialLoading}
        />
        <KpiCard
          label="Customer lending"
          value={formatCurrency(
            summary?.totalPortfolioValue ?? 0,
            currentInstitution.currency,
            true,
          )}
          note={`${summary?.fundedLoansCount ?? 0} funded loans`}
          icon={<TrendingUp className="h-4 w-4" />}
          tone="violet"
          sparklineIndex={2}
          isLoading={isInitialLoading}
        />
        <KpiCard
          label="Average score"
          value={summary?.averageScore ?? 0}
          note="Indicative credit rating"
          icon={<Award className="h-4 w-4" />}
          tone="orange"
          sparklineIndex={3}
          isLoading={isInitialLoading}
        />
      </div>

      <Card className="workspace-table-card">
        <div className="workspace-table-header">
          <div className="w-full sm:w-56">
            <Select
              value={customerFilter}
              onValueChange={(value) => {
                setCustomerFilter(value as CustomerDirectoryFilter);
                setPage(PAGINATION_DEFAULTS.INITIAL_PAGE);
              }}
            >
              <SelectTrigger aria-label="Filter customers" className="h-9 text-xs font-semibold">
                <SelectValue placeholder="Filter customers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All customers</SelectItem>
                <SelectItem value="ACTIVE">Active borrowers</SelectItem>
                <SelectItem value="HIGH_SCORE">Score 750+</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-full sm:w-64">
            <Input
              type="search"
              placeholder="Search customers..."
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
              title="Unable to load customers"
              description={getErrorMessage(error, 'Could not retrieve customer records.')}
              onRetry={() => {
                void refetch();
              }}
              isRetrying={isRefetching}
            />
          ) : items.length === 0 ? (
            <EmptyState
              title="No customers match this search"
              description="Try adjusting your search criteria."
              className="m-6"
            />
          ) : (
            <>
              <ResponsiveDataList
                table={
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Credit score</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Funded loans</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((c) => (
                        <TableRow
                          key={c.id}
                          onClick={() => router.push(APP_ROUTE_BUILDERS.LENDER.CUSTOMER(c.id))}
                          className="cursor-pointer transition-colors hover:bg-muted/30"
                        >
                          <TableCell>
                            <div className="flex items-center gap-2.5">
                              <Avatar name={c.business} size="sm" />
                              <div>
                                <span className="block font-semibold text-foreground">
                                  {c.business}
                                </span>
                                <span className="block text-2xs text-muted-foreground">
                                  {c.name}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="block text-foreground">{c.email}</span>
                            <span className="block text-2xs text-muted-foreground">{c.phone}</span>
                          </TableCell>
                          <TableCell>
                            <span className="font-mono font-semibold text-foreground">
                              {c.score}
                            </span>
                            <span className="ml-1 text-3xs text-muted-foreground">Indicative</span>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDate(c.joined)}
                          </TableCell>
                          <TableCell className="font-mono font-semibold text-foreground">
                            {c.fundedLoansCount}
                          </TableCell>
                          <TableCell
                            className="text-right"
                            onClick={(event) => event.stopPropagation()}
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(APP_ROUTE_BUILDERS.LENDER.CUSTOMER(c.id))}
                              className="h-7.5 gap-1.5 px-2.5 text-xs font-semibold"
                            >
                              <span>View</span>
                              <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                }
              >
                {items.map((customer) => (
                  <MobileDataCard
                    key={customer.id}
                    href={APP_ROUTE_BUILDERS.LENDER.CUSTOMER(customer.id)}
                    leading={<Avatar name={customer.business} size="sm" />}
                    title={customer.business}
                    subtitle={`${customer.name} · ${customer.phone}`}
                    value={`Score ${customer.score}`}
                    trailing={
                      <span className="text-2xs text-muted-foreground">
                        {customer.fundedLoansCount}{' '}
                        {customer.fundedLoansCount === 1 ? 'loan' : 'loans'}
                      </span>
                    }
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
                itemLabel="customers"
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
