import { PAGINATION_DEFAULTS, type PaginatedResult } from '@/lib/constants/pagination';
import type { RecordScope } from '@/types/api';

export function matchesScope(
  record: { readonly institutionId: string; readonly customerId?: string },
  scope?: RecordScope,
): boolean {
  if (!scope) return true;
  if (scope.institutionId && record.institutionId !== scope.institutionId) {
    return false;
  }
  if (scope.customerId && record.customerId !== scope.customerId) {
    return false;
  }
  return true;
}

export function paginate<T>(
  sourceItems: readonly T[],
  page: number = PAGINATION_DEFAULTS.INITIAL_PAGE,
  pageSize: number = PAGINATION_DEFAULTS.PAGE_SIZE,
): PaginatedResult<T> {
  const totalCount = sourceItems.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  // Clamp a stale page after filtering leaves fewer pages than before
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const offset = (currentPage - 1) * pageSize;
  const items = sourceItems.slice(offset, offset + pageSize);
  const startIndex = totalCount === 0 ? 0 : offset + 1;
  const endIndex = Math.min(offset + pageSize, totalCount);

  return {
    items,
    currentPage,
    pageSize,
    totalCount,
    totalPages,
    startIndex,
    endIndex,
    hasPreviousPage: currentPage > 1,
    hasNextPage: currentPage < totalPages,
  };
}
