'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { APP_ROUTES } from '@/lib/constants/routes';

export default function RootPage() {
  const router = useRouter();
  const session = useAuthStore((s) => s.session);
  const isLoading = useAuthStore((s) => s.isLoading);

  React.useEffect(() => {
    if (isLoading) return;

    if (session) {
      if (session.role === 'customer') {
        router.replace(APP_ROUTES.CUSTOMER.OVERVIEW);
      } else {
        router.replace(APP_ROUTES.LENDER.OVERVIEW);
      }
    } else {
      router.replace(APP_ROUTES.AUTH.LOGIN);
    }
  }, [session, isLoading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
        <span className="text-xs text-muted-foreground font-medium">Loading workspace...</span>
      </div>
    </div>
  );
}
