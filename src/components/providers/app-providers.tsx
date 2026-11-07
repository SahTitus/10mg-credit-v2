'use client';

import * as React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@/components/primitives/toast';
import { useAuthStore } from '@/store/auth-store';
import { useInstitutionStore } from '@/store/institution-store';

// Read saved state in a browser layout effect without running that effect on the server
const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? React.useLayoutEffect : React.useEffect;

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 3,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

  const initInstitutions = useInstitutionStore((s) => s.initializeFromStorage);
  const initAuth = useAuthStore((s) => s.initializeFromStorage);

  useIsomorphicLayoutEffect(() => {
    initInstitutions();
    initAuth();
  }, [initInstitutions, initAuth]);

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>{children}</ToastProvider>
    </QueryClientProvider>
  );
}
