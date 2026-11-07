'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/primitives/toast';
import { applicationApiService } from '@/lib/api/application-service';
import {
  APPLICATION_DEFAULTS,
  type ApplicationStatusFilter,
} from '@/lib/constants/application-statuses';
import { PAGINATION_DEFAULTS } from '@/lib/constants/pagination';
import { QUERY_KEYS } from '@/lib/constants/query-keys';
import { APP_ROUTES } from '@/lib/constants/routes';
import { getErrorMessage } from '@/lib/errors/error-handler';
import { formatCurrency } from '@/lib/utils/formatters';
import { keepScopedPreviousData } from '@/lib/utils/query-helpers';
import { invalidateAfterApplicationCreated } from '@/lib/utils/query-invalidation';
import { useDebounce } from '@/lib/utils/use-debounce';
import { usePaginationState } from '@/lib/utils/use-pagination';
import { useInstitutionStore } from '@/store/institution-store';

interface NewApplicationDraft {
  applicantName: string;
  businessName: string;
  email: string;
  phone: string;
  location: string;
  amount: string;
  purpose: string;
  term: number;
}

const initialDraft = (): NewApplicationDraft => ({
  applicantName: '',
  businessName: '',
  email: '',
  phone: '',
  location: '',
  amount: '',
  purpose: APPLICATION_DEFAULTS.purpose,
  term: APPLICATION_DEFAULTS.term,
});

export function useLenderApplications() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedNewModal = searchParams.get('new') === 'true';
  const queryClient = useQueryClient();
  const currentInstitution = useInstitutionStore((state) => state.currentInstitution);
  const { toast, error: toastError } = useToast();
  const [activeTab, setActiveTabState] = React.useState<ApplicationStatusFilter>('All');
  const [search, setSearchState] = React.useState('');
  const [isNewModalOpenState, setIsNewModalOpenState] = React.useState(false);
  const [draft, setDraft] = React.useState<NewApplicationDraft>(initialDraft);

  const draftAmount = Number(draft.amount) || 0;
  const isDraftAmountInRange =
    draftAmount >= currentInstitution.minLoan && draftAmount <= currentInstitution.maxLoan;
  const draftAmountError =
    draft.amount !== '' && !isDraftAmountInRange
      ? `Enter between ${formatCurrency(currentInstitution.minLoan, currentInstitution.currency)} and ${formatCurrency(currentInstitution.maxLoan, currentInstitution.currency)}`
      : undefined;
  const canSubmitDraft =
    Boolean(draft.businessName.trim()) &&
    Boolean(draft.applicantName.trim()) &&
    isDraftAmountInRange;

  // The URL can open the form from another page without relying on local state
  const isNewModalOpen = isNewModalOpenState || requestedNewModal;

  const setIsNewModalOpen = React.useCallback(
    (open: boolean) => {
      setIsNewModalOpenState(open);
      if (!open && searchParams.get('new')) {
        router.replace(APP_ROUTES.LENDER.APPLICATIONS, { scroll: false });
      }
    },
    [router, searchParams],
  );

  const debouncedSearch = useDebounce(search);
  const [page, setPage] = usePaginationState(
    `${currentInstitution.id}:${activeTab}:${debouncedSearch}`,
  );

  const setActiveTab = React.useCallback((nextTab: ApplicationStatusFilter) => {
    setActiveTabState(nextTab);
  }, []);

  const setSearch = React.useCallback((nextSearch: string) => {
    setSearchState(nextSearch);
  }, []);

  const { data, isPending, isPlaceholderData, isError, error, refetch, isRefetching } = useQuery({
    queryKey: QUERY_KEYS.APPLICATIONS_PAGINATED(
      currentInstitution.id,
      activeTab,
      debouncedSearch,
      page,
    ),
    queryFn: () =>
      applicationApiService.listPaginated({
        institutionId: currentInstitution.id,
        status: activeTab,
        search: debouncedSearch,
        page,
        pageSize: PAGINATION_DEFAULTS.PAGE_SIZE,
      }),
    placeholderData: keepScopedPreviousData(currentInstitution.id),
  });

  const summary = data?.summary;
  const applications = data?.items ?? [];

  const pagination = {
    items: applications,
    currentPage: data?.currentPage ?? page,
    pageSize: data?.pageSize ?? PAGINATION_DEFAULTS.PAGE_SIZE,
    totalCount: data?.totalCount ?? 0,
    totalPages: data?.totalPages ?? 1,
    startIndex: data?.startIndex ?? 0,
    endIndex: data?.endIndex ?? 0,
    setPage,
  };

  const createMutation = useMutation({
    mutationFn: () =>
      applicationApiService.create({
        institutionId: currentInstitution.id,
        name: draft.applicantName,
        business: draft.businessName,
        email: draft.email,
        phone: draft.phone,
        location: draft.location,
        amount: draftAmount,
        purpose: draft.purpose,
        term: draft.term,
      }),
    onSuccess: (created) => {
      invalidateAfterApplicationCreated(queryClient, {
        institutionId: currentInstitution.id,
        applicationId: created.id,
        customerId: created.customerId,
      });
      toast('Application created', `Application ${created.id} submitted`, 'success');
      setIsNewModalOpen(false);
      setDraft(initialDraft());
    },
    onError: (error) => {
      toastError(
        'Creation failed',
        error instanceof Error ? error.message : 'Could not create application',
      );
    },
  });

  const exportApplications = async () => {
    // Export every matching record, including those beyond the visible page
    const exported = await applicationApiService.list(
      currentInstitution.id,
      activeTab,
      debouncedSearch,
    );
    const headers = [
      'ID,Business,Applicant,Email,Phone,Location,Amount,Term,Purpose,Status,Submitted\n',
    ];
    const rows = exported.map(
      (application) =>
        `"${application.id}","${application.business}","${application.name}","${application.email ?? ''}","${application.phone ?? ''}","${application.location ?? ''}","${application.amount}","${application.term}","${application.purpose}","${application.status}","${application.submitted}"\n`,
    );
    const url = URL.createObjectURL(new Blob([...headers, ...rows], { type: 'text/csv' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentInstitution.short}-applications-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast('Export complete', 'Applications downloaded as CSV', 'info');
  };

  return {
    activeTab,
    applications,
    pagination,
    approvalRate: summary?.approvalRate ?? 0,
    approvedCount: summary?.approvedCount ?? 0,
    approvedValue: summary?.approvedValue ?? 0,
    declinedCount: summary?.declinedCount ?? 0,
    totalCount: summary?.totalCount ?? 0,
    createMutation,
    currentInstitution,
    draft,
    draftAmountError,
    canSubmitDraft,
    exportApplications,
    isLoading: isPending,
    isTableLoading: isPending,
    isPlaceholderData,
    isError,
    errorMessage: getErrorMessage(error, 'Unable to load loan applications.'),
    retry: () => {
      void refetch();
    },
    isRetrying: isRefetching,
    isNewModalOpen,
    pendingTotal: summary?.pendingCount ?? 0,
    pendingValue: summary?.pendingValue ?? 0,
    search,
    setActiveTab,
    setDraft,
    setIsNewModalOpen,
    setSearch,
  };
}
