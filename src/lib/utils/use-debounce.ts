'use client';

import * as React from 'react';
import { PAGINATION_DEFAULTS } from '@/lib/constants/pagination';

export function useDebounce<T>(
  value: T,
  delayMs: number = PAGINATION_DEFAULTS.SEARCH_DEBOUNCE_MS,
): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => {
      window.clearTimeout(timer);
    };
  }, [value, delayMs]);

  return debouncedValue;
}
