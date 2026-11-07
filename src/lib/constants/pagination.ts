export const PAGINATION_DEFAULTS = {
  INITIAL_PAGE: 1,
  PAGE_SIZE: 5,
  PAGE_SIZE_OPTIONS: [5, 10, 20],
  SEARCH_DEBOUNCE_MS: 300,
} as const;

export interface PaginationMetadata {
  readonly currentPage: number;
  readonly pageSize: number;
  readonly totalCount: number;
  readonly totalPages: number;
  readonly startIndex: number;
  readonly endIndex: number;
  readonly hasPreviousPage: boolean;
  readonly hasNextPage: boolean;
}

export interface PaginatedResult<T> extends PaginationMetadata {
  readonly items: readonly T[];
}
