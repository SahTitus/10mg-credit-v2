'use client';

import { useRouter } from 'next/navigation';
import { CheckCircle2, Clock, Eye, Plus, Receipt, Search, Wallet } from 'lucide-react';
import { StatusBadge } from '@/components/primitives/badge';
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
import { MakeRepaymentDialog } from '@/features/repayments/components/make-repayment-dialog';
import { useCustomerRepayments } from '@/features/repayments/hooks/use-customer-repayments';
import { PAGINATION_DEFAULTS } from '@/lib/constants/pagination';
import { APP_ROUTE_BUILDERS } from '@/lib/constants/routes';
import { formatCurrency, formatDate, formatTime } from '@/lib/utils/formatters';

export default function CustomerPaymentsPage() {
  const router = useRouter();
  const state = useCustomerRepayments();
  const { currency } = state.institution;

  return (
    <div className="workspace-page">
      <div className="workspace-heading">
        <div>
          <h1>Payment history</h1>
          <p>A clear record of every repayment.</p>
        </div>
        <Button
          variant="primary"
          onClick={state.openDialog}
          disabled={state.activeLoans.length === 0}
          className="self-end shrink-0 sm:self-auto"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Make a repayment
        </Button>
      </div>

      <div className="workspace-kpi-grid">
        <KpiCard
          label="Total repaid"
          value={formatCurrency(state.totalRepaid, currency, true)}
          note="Settled to date"
          icon={<CheckCircle2 className="h-4 w-4" />}
          tone="green"
          sparklineIndex={0}
          isLoading={state.isLoading}
        />
        <KpiCard
          label="Outstanding balance"
          value={formatCurrency(state.outstanding, currency, true)}
          note="Remaining loan balance"
          icon={<Clock className="h-4 w-4" />}
          tone="orange"
          sparklineIndex={1}
          isLoading={state.isLoading}
        />
        <KpiCard
          label="Recorded payments"
          value={state.recordedCount}
          note="Confirmed receipts"
          icon={<Receipt className="h-4 w-4" />}
          tone="blue"
          sparklineIndex={2}
          isLoading={state.isLoading}
        />
        <KpiCard
          label="Active facilities"
          value={state.activeLoans.length}
          note="Eligible for repayment"
          icon={<Wallet className="h-4 w-4" />}
          tone="violet"
          sparklineIndex={3}
          isLoading={state.isLoading}
        />
      </div>

      <Card className="workspace-table-card">
        <div className="workspace-table-header">
          <div className="w-full sm:w-56">
            <Select
              value={state.loanFilter}
              onValueChange={(value) => {
                state.setLoanFilter(value);
                state.pagination.setPage(PAGINATION_DEFAULTS.INITIAL_PAGE);
              }}
            >
              <SelectTrigger
                aria-label="Filter payments by loan account"
                className="h-9 text-xs font-semibold"
              >
                <SelectValue placeholder="Filter payments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All payments</SelectItem>
                {state.loans.map((loan) => (
                  <SelectItem key={loan.id} value={loan.id}>
                    {loan.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-full sm:w-64">
            <Input
              type="search"
              placeholder="Search payments..."
              value={state.search}
              onChange={(e) => state.setSearch(e.target.value)}
              prefixIcon={<Search className="h-3.5 w-3.5" />}
              className="h-9 text-xs"
            />
          </div>
        </div>

        <CardContent
          className={state.isPlaceholderData ? 'p-0 opacity-65 transition-opacity' : 'p-0'}
        >
          {state.isTableLoading ? (
            <div className="space-y-3 p-6">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : state.isError ? (
            <QueryErrorState
              className="m-6"
              title="Unable to load payments"
              description={state.errorMessage}
              onRetry={state.retry}
              isRetrying={state.isRetrying}
            />
          ) : state.totalCount === 0 ? (
            <EmptyState
              className="m-6"
              icon={<Receipt className="h-5 w-5" />}
              title="No repayment records found"
              description="No completed repayments match your current filter or search."
            />
          ) : (
            <>
              <ResponsiveDataList
                table={
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Reference</TableHead>
                        <TableHead>Loan ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {state.pagination.items.map((payment) => (
                        <TableRow
                          key={payment.id}
                          onClick={() =>
                            router.push(APP_ROUTE_BUILDERS.CUSTOMER.PAYMENT(payment.id))
                          }
                          className="cursor-pointer transition-colors hover:bg-muted/30"
                        >
                          <TableCell className="font-mono font-semibold text-foreground">
                            {payment.id}
                          </TableCell>
                          <TableCell className="font-mono text-muted-foreground">
                            {payment.loanId}
                          </TableCell>
                          <TableCell>
                            <span className="block font-semibold text-foreground">
                              {formatDate(payment.date)}
                            </span>
                            <span className="block text-2xs text-muted-foreground">
                              {formatTime(payment.date)}
                            </span>
                          </TableCell>
                          <TableCell className="font-mono font-bold text-foreground">
                            {formatCurrency(payment.amount, currency)}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={payment.status} />
                          </TableCell>
                          <TableCell
                            className="text-right"
                            onClick={(event) => event.stopPropagation()}
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                router.push(APP_ROUTE_BUILDERS.CUSTOMER.PAYMENT(payment.id))
                              }
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
                {state.pagination.items.map((payment) => (
                  <MobileDataCard
                    key={payment.id}
                    href={APP_ROUTE_BUILDERS.CUSTOMER.PAYMENT(payment.id)}
                    leading={
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-positive-pale text-positive">
                        <Receipt className="h-4 w-4" aria-hidden="true" />
                      </span>
                    }
                    title={payment.id}
                    subtitle={`${payment.loanId} · ${formatDate(payment.date)} · ${formatTime(payment.date)}`}
                    value={formatCurrency(payment.amount, currency)}
                    trailing={<StatusBadge status={payment.status} />}
                  />
                ))}
              </ResponsiveDataList>

              <Pagination
                currentPage={state.pagination.currentPage}
                totalPages={state.pagination.totalPages}
                totalCount={state.pagination.totalCount}
                startIndex={state.pagination.startIndex}
                endIndex={state.pagination.endIndex}
                onPageChange={state.pagination.setPage}
                itemLabel="payments"
              />
            </>
          )}
        </CardContent>
      </Card>

      <MakeRepaymentDialog state={state} />
    </div>
  );
}
