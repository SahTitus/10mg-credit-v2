'use client';

import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/primitives/toast';
import { useCustomerPortfolio } from '@/features/customers/hooks/use-customer-portfolio';
import { repaymentApiService } from '@/lib/api/repayment-service';
import { LOAN_STATUSES } from '@/lib/constants/application-statuses';
import { PAGINATION_DEFAULTS } from '@/lib/constants/pagination';
import { QUERY_KEYS } from '@/lib/constants/query-keys';
import { getErrorMessage } from '@/lib/errors/error-handler';
import { formatCurrency } from '@/lib/utils/formatters';
import { getLoanBalance } from '@/lib/utils/loan-metrics';
import { keepScopedPreviousData } from '@/lib/utils/query-helpers';
import { invalidateAfterRepayment } from '@/lib/utils/query-invalidation';
import { useDebounce } from '@/lib/utils/use-debounce';
import { usePaginationState } from '@/lib/utils/use-pagination';

export function useCustomerRepayments() {
  const queryClient = useQueryClient();
  const { toast, error: toastError } = useToast();
  const portfolio = useCustomerPortfolio();
  const { institution, customerId, loans, totals, isLoading } = portfolio;
  const [loanFilter, setLoanFilter] = React.useState('ALL');
  const [search, setSearch] = React.useState('');

  const debouncedSearch = useDebounce(search);
  const [page, setPage] = usePaginationState(
    `${institution.id}:${customerId}:${loanFilter}:${debouncedSearch}`,
  );

  const repaymentsQuery = useQuery({
    queryKey: QUERY_KEYS.REPAYMENTS_PAGINATED(
      institution.id,
      loanFilter,
      debouncedSearch,
      page,
      customerId,
    ),
    queryFn: () =>
      repaymentApiService.listPaginated({
        institutionId: institution.id,
        customerId,
        loanId: loanFilter,
        search: debouncedSearch,
        page,
        pageSize: PAGINATION_DEFAULTS.PAGE_SIZE,
      }),
    placeholderData: keepScopedPreviousData(institution.id, customerId, 6),
  });

  const repaymentsPage = repaymentsQuery.data;
  const activeLoans = React.useMemo(
    () => loans.filter((loan) => loan.status === LOAN_STATUSES.ACTIVE),
    [loans],
  );

  const repayments = repaymentsPage?.items ?? [];
  const totalCount = repaymentsPage?.totalCount ?? 0;
  const recordedCount = repaymentsPage?.summary?.paymentsCount ?? portfolio.repayments.length;

  const pagination = {
    items: repayments,
    currentPage: repaymentsPage?.currentPage ?? page,
    pageSize: repaymentsPage?.pageSize ?? PAGINATION_DEFAULTS.PAGE_SIZE,
    totalCount,
    totalPages: repaymentsPage?.totalPages ?? 1,
    startIndex: repaymentsPage?.startIndex ?? 0,
    endIndex: repaymentsPage?.endIndex ?? 0,
    setPage,
  };

  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [selectedLoanId, setSelectedLoanId] = React.useState('');
  const [amountInput, setAmountInput] = React.useState('');

  const selectedLoan = React.useMemo(
    () => activeLoans.find((loan) => loan.id === selectedLoanId) ?? activeLoans[0],
    [activeLoans, selectedLoanId],
  );

  const maxPayable = selectedLoan ? getLoanBalance(selectedLoan) : 0;
  const amount = Number(amountInput) || 0;
  const isValidAmount = amount > 0 && amount <= maxPayable;

  const openDialog = () => {
    const defaultLoan = activeLoans[0];
    setSelectedLoanId(defaultLoan?.id ?? '');
    // Suggest one instalment, capped at the balance left on the selected loan
    setAmountInput(
      defaultLoan
        ? String(
            Math.min(
              getLoanBalance(defaultLoan),
              Math.round(defaultLoan.totalDue / defaultLoan.term),
            ),
          )
        : '',
    );
    setIsDialogOpen(true);
  };

  const payMutation = useMutation({
    mutationFn: () => {
      if (!selectedLoan) {
        throw new Error('Select an active loan account.');
      }
      if (!isValidAmount) {
        throw new Error(
          `Enter an amount up to ${formatCurrency(maxPayable, institution.currency)}.`,
        );
      }
      return repaymentApiService.record({
        institutionId: institution.id,
        loanId: selectedLoan.id,
        customerId,
        amount,
      });
    },
    onSuccess: (payment) => {
      invalidateAfterRepayment(queryClient, {
        institutionId: institution.id,
        loanId: payment.loanId,
        repaymentId: payment.id,
        customerId,
      });
      toast(
        'Payment recorded',
        `${formatCurrency(payment.amount, institution.currency)} added to ${payment.loanId}.`,
        'success',
      );
      setIsDialogOpen(false);
    },
    onError: (err) => {
      toastError(
        'Payment failed',
        err instanceof Error ? err.message : 'Could not record payment.',
      );
    },
  });

  const isError = portfolio.isError || repaymentsQuery.isError;
  const errorMessage = getErrorMessage(
    repaymentsQuery.error,
    portfolio.isError ? portfolio.errorMessage : 'Unable to load payment history.',
  );

  const retry = () => {
    if (portfolio.isError) portfolio.retry();
    if (repaymentsQuery.isError) void repaymentsQuery.refetch();
  };

  return {
    institution,
    loans,
    repayments,
    totalCount,
    recordedCount,
    loanFilter,
    setLoanFilter,
    search,
    setSearch,
    pagination,
    activeLoans,
    totalRepaid: totals.repaid,
    outstanding: totals.outstanding,
    isLoading,
    isTableLoading: repaymentsQuery.isPending,
    isPlaceholderData: repaymentsQuery.isPlaceholderData,
    isError,
    errorMessage,
    retry,
    isRetrying: portfolio.isRetrying || repaymentsQuery.isRefetching,
    isDialogOpen,
    setIsDialogOpen,
    openDialog,
    selectedLoanId: selectedLoan?.id ?? '',
    setSelectedLoanId,
    amountInput,
    setAmountInput,
    maxPayable,
    canSubmit: Boolean(selectedLoan) && isValidAmount,
    submitPayment: () => payMutation.mutate(),
    isSubmitting: payMutation.isPending,
  };
}

export type CustomerRepaymentsState = ReturnType<typeof useCustomerRepayments>;
