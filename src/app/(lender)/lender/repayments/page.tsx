'use client';

import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { CheckCircle2, DollarSign, Eye, Plus, Receipt, Search, TrendingUp } from 'lucide-react';
import { Avatar } from '@/components/primitives/avatar';
import { StatusBadge } from '@/components/primitives/badge';
import { Button } from '@/components/primitives/button';
import { Card, CardContent } from '@/components/primitives/card';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/primitives/dialog';
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
import { KpiCard } from '@/components/shared/kpi-card';
import { QueryErrorState } from '@/components/shared/query-error-state';
import { MobileDataCard, ResponsiveDataList } from '@/components/shared/responsive-data-list';
import { loanApiService } from '@/lib/api/loan-service';
import { repaymentApiService } from '@/lib/api/repayment-service';
import { LOAN_STATUSES } from '@/lib/constants/application-statuses';
import { PAGINATION_DEFAULTS } from '@/lib/constants/pagination';
import { QUERY_KEYS } from '@/lib/constants/query-keys';
import { APP_ROUTE_BUILDERS } from '@/lib/constants/routes';
import { getErrorMessage } from '@/lib/errors/error-handler';
import { formatCurrency, formatDate, getCurrencySymbol } from '@/lib/utils/formatters';
import { getLoanBalance } from '@/lib/utils/loan-metrics';
import { keepScopedPreviousData } from '@/lib/utils/query-helpers';
import { invalidateAfterRepayment } from '@/lib/utils/query-invalidation';
import { useDebounce } from '@/lib/utils/use-debounce';
import { usePaginationState } from '@/lib/utils/use-pagination';
import { recordRepaymentSchema } from '@/lib/validations/repayment.schema';
import { useInstitutionStore } from '@/store/institution-store';

export default function RepaymentsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const currentInstitution = useInstitutionStore((s) => s.currentInstitution);
  const { toast, error: toastError } = useToast();

  const [search, setSearch] = React.useState('');
  const [loanFilter, setLoanFilter] = React.useState('ALL');
  const [isRecordModalOpen, setIsRecordModalOpen] = React.useState(false);
  const [selectedLoanId, setSelectedLoanId] = React.useState('');
  const [paymentAmountInput, setPaymentAmountInput] = React.useState('');

  const debouncedSearch = useDebounce(search);
  const [page, setPage] = usePaginationState(
    `${currentInstitution.id}:${loanFilter}:${debouncedSearch}`,
  );

  const { data, isPending, isPlaceholderData, isError, error, refetch, isRefetching } = useQuery({
    queryKey: QUERY_KEYS.REPAYMENTS_PAGINATED(
      currentInstitution.id,
      loanFilter,
      debouncedSearch,
      page,
    ),
    queryFn: () =>
      repaymentApiService.listPaginated({
        institutionId: currentInstitution.id,
        loanId: loanFilter,
        search: debouncedSearch,
        page,
        pageSize: PAGINATION_DEFAULTS.PAGE_SIZE,
      }),
    placeholderData: keepScopedPreviousData(currentInstitution.id),
  });

  const { data: loans = [] } = useQuery({
    queryKey: QUERY_KEYS.LOANS(currentInstitution.id),
    queryFn: () => loanApiService.list(currentInstitution.id),
  });

  const summary = data?.summary;
  const items = data?.items ?? [];
  const isInitialLoading = isPending;
  const isTableLoading = isPending;

  const payableLoans = React.useMemo(
    () => loans.filter((l) => l.status !== LOAN_STATUSES.COMPLETED && getLoanBalance(l) > 0),
    [loans],
  );

  const selectedLoan = React.useMemo(
    () => payableLoans.find((l) => l.id === selectedLoanId),
    [payableLoans, selectedLoanId],
  );
  const remainingBalance = selectedLoan ? getLoanBalance(selectedLoan) : 0;
  const paymentAmount = Number(paymentAmountInput) || 0;
  const isAmountValid =
    Boolean(selectedLoan) && paymentAmount > 0 && paymentAmount <= remainingBalance;
  const amountError =
    selectedLoan && paymentAmountInput !== '' && paymentAmount <= 0
      ? 'Enter an amount greater than zero'
      : selectedLoan && paymentAmount > remainingBalance
        ? `Exceeds remaining balance (${formatCurrency(remainingBalance, currentInstitution.currency)})`
        : undefined;

  const handleSelectLoan = React.useCallback(
    (loanId: string) => {
      setSelectedLoanId(loanId);
      const target = payableLoans.find((l) => l.id === loanId);
      if (target) {
        const balance = getLoanBalance(target);
        const suggested = Math.min(balance, Math.max(1, Math.round(target.totalDue / target.term)));
        setPaymentAmountInput(String(suggested));
      } else {
        setPaymentAmountInput('');
      }
    },
    [payableLoans],
  );

  const openRecordModal = React.useCallback(() => {
    const defaultLoan = payableLoans[0];
    if (defaultLoan) {
      const balance = getLoanBalance(defaultLoan);
      const suggested = Math.min(
        balance,
        Math.max(1, Math.round(defaultLoan.totalDue / defaultLoan.term)),
      );
      setSelectedLoanId(defaultLoan.id);
      setPaymentAmountInput(String(suggested));
    } else {
      setSelectedLoanId('');
      setPaymentAmountInput('');
    }
    setIsRecordModalOpen(true);
  }, [payableLoans]);

  const recordMutation = useMutation({
    mutationFn: () => {
      const parsed = recordRepaymentSchema.safeParse({
        institutionId: currentInstitution.id,
        loanId: selectedLoan?.id ?? '',
        customerId: selectedLoan?.customerId ?? '',
        amount: paymentAmount,
      });
      if (!parsed.success || !selectedLoan) {
        throw new Error(parsed.error?.issues[0]?.message ?? 'Please select an active loan');
      }
      if (parsed.data.amount > remainingBalance) {
        throw new Error(
          `Payment exceeds remaining balance of ${formatCurrency(remainingBalance, currentInstitution.currency)}`,
        );
      }
      return repaymentApiService.record(parsed.data);
    },
    onSuccess: (created) => {
      invalidateAfterRepayment(queryClient, {
        institutionId: currentInstitution.id,
        loanId: created.loanId,
        repaymentId: created.id,
        customerId: created.customerId,
      });
      toast('Payment Recorded', `Payment #${created.id} saved successfully`, 'success');
      setIsRecordModalOpen(false);
      setSelectedLoanId('');
      setPaymentAmountInput('');
    },
    onError: (err) => {
      toastError('Payment Failed', err instanceof Error ? err.message : 'Could not record payment');
    },
  });

  return (
    <div className="workspace-page">
      <div className="workspace-heading">
        <div>
          <h1>Repayments</h1>
          <p>
            <span className="sm:hidden">Track payments across your portfolio.</span>
            <span className="hidden sm:inline">
              Track payments received against your lending portfolio across{' '}
              {currentInstitution.short}.
            </span>
          </p>
        </div>
        <Button
          variant="primary"
          onClick={openRecordModal}
          className="self-end shrink-0 sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Record payment</span>
        </Button>
      </div>

      <div className="workspace-kpi-grid">
        <KpiCard
          label="Total collected"
          value={formatCurrency(summary?.totalCollected ?? 0, currentInstitution.currency, true)}
          note="Across all repayments"
          icon={<DollarSign className="h-4 w-4" />}
          tone="green"
          sparklineIndex={0}
          isLoading={isInitialLoading}
        />
        <KpiCard
          label="Payments received"
          value={summary?.paymentsCount ?? 0}
          note="Recorded transactions"
          icon={<CheckCircle2 className="h-4 w-4" />}
          tone="blue"
          sparklineIndex={1}
          isLoading={isInitialLoading}
        />
        <KpiCard
          label="Collection progress"
          value={`${summary?.collectionRate ?? 0}%`}
          note="Of scheduled loan value"
          icon={<TrendingUp className="h-4 w-4" />}
          tone="violet"
          sparklineIndex={2}
          isLoading={isInitialLoading}
        />
        <KpiCard
          label="Average payment"
          value={formatCurrency(summary?.averagePayment ?? 0, currentInstitution.currency, true)}
          note="Per recorded transaction"
          icon={<Receipt className="h-4 w-4" />}
          tone="orange"
          sparklineIndex={3}
          isLoading={isInitialLoading}
        />
      </div>

      <Card className="workspace-table-card">
        <div className="workspace-table-header">
          <div className="w-full sm:w-56">
            <Select
              value={loanFilter}
              onValueChange={(value) => {
                setLoanFilter(value);
                setPage(PAGINATION_DEFAULTS.INITIAL_PAGE);
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
                {loans.map((loan) => (
                  <SelectItem key={loan.id} value={loan.id}>
                    {loan.id} · {loan.business}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-full sm:w-64">
            <Input
              type="search"
              placeholder="Search payments..."
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
              title="Unable to load repayments"
              description={getErrorMessage(error, 'Could not retrieve repayment records.')}
              onRetry={() => {
                void refetch();
              }}
              isRetrying={isRefetching}
            />
          ) : items.length === 0 ? (
            <EmptyState
              title="No payments recorded"
              description="No payment records match your search."
              className="m-6"
            />
          ) : (
            <>
              <ResponsiveDataList
                table={
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Reference</TableHead>
                        <TableHead>Borrower</TableHead>
                        <TableHead>Loan ID</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((r) => (
                        <TableRow
                          key={r.id}
                          onClick={() => router.push(APP_ROUTE_BUILDERS.LENDER.REPAYMENT(r.id))}
                          className="cursor-pointer transition-colors hover:bg-muted/30"
                        >
                          <TableCell className="font-mono font-semibold text-foreground">
                            {r.id}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2.5">
                              <Avatar name={r.business} size="sm" />
                              <div>
                                <span className="block font-semibold text-foreground">
                                  {r.business}
                                </span>
                                <span className="block text-2xs text-muted-foreground">
                                  {r.name}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-muted-foreground">
                            {r.loanId}
                          </TableCell>
                          <TableCell className="font-mono font-bold text-foreground">
                            {formatCurrency(r.amount, currentInstitution.currency)}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDate(r.date)}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={r.status} />
                          </TableCell>
                          <TableCell
                            className="text-right"
                            onClick={(event) => event.stopPropagation()}
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(APP_ROUTE_BUILDERS.LENDER.REPAYMENT(r.id))}
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
                {items.map((payment) => (
                  <MobileDataCard
                    key={payment.id}
                    href={APP_ROUTE_BUILDERS.LENDER.REPAYMENT(payment.id)}
                    leading={<Avatar name={payment.business} size="sm" />}
                    title={payment.business}
                    subtitle={`${payment.id} · ${formatDate(payment.date)}`}
                    value={formatCurrency(payment.amount, currentInstitution.currency)}
                    trailing={<StatusBadge status={payment.status} />}
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
                itemLabel="repayments"
              />
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={isRecordModalOpen} onOpenChange={setIsRecordModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Record repayment</DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-4 text-xs">
            <div className="space-y-1">
              <label
                htmlFor="modal-select-loan"
                className="block text-xs font-semibold text-foreground/90"
              >
                Select facility
              </label>
              <Select value={selectedLoanId} onValueChange={handleSelectLoan}>
                <SelectTrigger id="modal-select-loan" className="h-9.5 text-xs">
                  <SelectValue
                    placeholder={
                      payableLoans.length > 0 ? 'Choose loan account' : 'No open loan accounts'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {payableLoans.map((l) => (
                    <SelectItem key={l.id} value={l.id}>
                      {l.id} — {l.business} (
                      {formatCurrency(getLoanBalance(l), currentInstitution.currency)} remaining)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Input
              id="modal-payment-amount"
              label={`Payment amount (${getCurrencySymbol(currentInstitution.currency)})`}
              type="number"
              inputMode="numeric"
              min={1}
              max={remainingBalance || undefined}
              value={paymentAmountInput}
              onChange={(e) => setPaymentAmountInput(e.target.value)}
              error={amountError}
              helperText={
                selectedLoan && !amountError
                  ? `Up to ${formatCurrency(remainingBalance, currentInstitution.currency)} remaining`
                  : undefined
              }
            />
          </DialogBody>
          <DialogFooter>
            <Button
              variant="primary"
              onClick={() => recordMutation.mutate()}
              isLoading={recordMutation.isPending}
              disabled={!isAmountValid}
            >
              Confirm payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
