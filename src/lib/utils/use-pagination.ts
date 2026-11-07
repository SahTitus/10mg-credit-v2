'use client';

import * as React from 'react';
import { PAGINATION_DEFAULTS } from '@/lib/constants/pagination';

interface PaginationScopeState {
  readonly page: number;
  readonly scopeKey: string;
}

export function usePaginationState(
  scopeKey: string,
): readonly [number, (nextPage: number) => void] {
  const [state, setState] = React.useState<PaginationScopeState>({
    page: PAGINATION_DEFAULTS.INITIAL_PAGE,
    scopeKey,
  });

  // A new scope reads page one immediately, before the next state update
  const currentPage = state.scopeKey === scopeKey ? state.page : PAGINATION_DEFAULTS.INITIAL_PAGE;

  const setPage = React.useCallback(
    (nextPage: number) => {
      setState({
        page: Math.max(PAGINATION_DEFAULTS.INITIAL_PAGE, nextPage),
        scopeKey,
      });
    },
    [scopeKey],
  );

  return [currentPage, setPage] as const;
}
