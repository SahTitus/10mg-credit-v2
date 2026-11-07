import { isNotFoundError } from '@/lib/errors/error-handler';

export function keepScopedPreviousData(
  institutionId: string,
  customerId?: string,
  customerKeyIndex?: number,
) {
  return <TData>(
    previousData: TData | undefined,
    previousQuery: { readonly queryKey: readonly unknown[] } | undefined,
  ): TData | undefined => {
    if (!previousData || !previousQuery) return undefined;
    const prevKey = previousQuery.queryKey;
    // Reuse page data only while the institution and borrower remain the same
    if (prevKey[1] !== institutionId) {
      return undefined;
    }
    if (customerId !== undefined && customerKeyIndex !== undefined) {
      if (prevKey[customerKeyIndex] !== customerId) {
        return undefined;
      }
    }
    return previousData;
  };
}

// Skip retries when a record does not exist so invalid URLs show the not-found view immediately
export function shouldRetryDetailQuery(failureCount: number, error: unknown): boolean {
  return !isNotFoundError(error) && failureCount < 1;
}
