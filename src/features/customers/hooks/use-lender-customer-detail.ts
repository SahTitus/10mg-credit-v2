'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { customerApiService } from '@/lib/api/customer-service';
import { QUERY_KEYS } from '@/lib/constants/query-keys';
import { getErrorMessage, isNotFoundError } from '@/lib/errors/error-handler';
import { shouldRetryDetailQuery } from '@/lib/utils/query-helpers';
import { useInstitutionStore } from '@/store/institution-store';

export function useLenderCustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const customerId = decodeURIComponent(id);
  const institution = useInstitutionStore((state) => state.currentInstitution);

  const query = useQuery({
    queryKey: QUERY_KEYS.CUSTOMER_DETAIL(customerId, institution.id),
    queryFn: () => customerApiService.getById(customerId, { institutionId: institution.id }),
    retry: shouldRetryDetailQuery,
  });

  const customer = query.data?.institutionId === institution.id ? query.data : undefined;
  const isNotFound = query.isError && isNotFoundError(query.error);
  const isError = query.isError && !isNotFound;
  const isLoading = query.isPending;

  return {
    institution,
    customer,
    isLoading,
    isError,
    errorMessage: getErrorMessage(query.error, 'Unable to load customer profile.'),
    retry: () => {
      void query.refetch();
    },
    isRetrying: query.isRefetching,
    isMissing: !isLoading && !isError && !customer,
  };
}
