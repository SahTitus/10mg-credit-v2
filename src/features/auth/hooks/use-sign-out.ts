'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/primitives/toast';
import { authApiService } from '@/lib/api/auth-service';
import { APP_ROUTES } from '@/lib/constants/routes';
import { useAuthStore } from '@/store/auth-store';
import { useUIStore } from '@/store/ui-store';

export function useSignOut() {
  const router = useRouter();
  const { toast } = useToast();
  const isSigningOut = useAuthStore((state) => state.isSigningOut);
  const setIsSigningOut = useAuthStore((state) => state.setIsSigningOut);
  const clearSession = useAuthStore((state) => state.clearSession);
  const setMobileSidebarOpen = useUIStore((state) => state.setMobileSidebarOpen);

  const signOut = React.useCallback(async () => {
    // Share sign-out state across menus so duplicate clicks cannot trigger parallel logouts
    if (isSigningOut) return;
    setIsSigningOut(true);
    try {
      await authApiService.logout();
      clearSession();
      setMobileSidebarOpen(false);
      toast('Signed out', 'Your session has ended', 'info');
      router.push(APP_ROUTES.AUTH.LOGIN);
    } catch {
      setIsSigningOut(false);
    }
  }, [clearSession, isSigningOut, router, setIsSigningOut, setMobileSidebarOpen, toast]);

  return {
    signOut,
    isSigningOut,
  };
}
