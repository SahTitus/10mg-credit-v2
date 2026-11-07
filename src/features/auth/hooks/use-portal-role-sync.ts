'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { authApiService } from '@/lib/api/auth-service';
import { PORTAL_PREFIXES } from '@/lib/constants/routes';
import { useAuthStore } from '@/store/auth-store';
import { useInstitutionStore } from '@/store/institution-store';
import type { UserRole } from '@/types/auth';

const getRouteRole = (pathname: string): UserRole | null => {
  if (pathname.startsWith(PORTAL_PREFIXES.CUSTOMER)) return 'customer';
  if (pathname.startsWith(PORTAL_PREFIXES.LENDER)) return 'lender';
  return null;
};

export function usePortalRoleSync() {
  const pathname = usePathname();
  const session = useAuthStore((state) => state.session);
  const setSession = useAuthStore((state) => state.setSession);
  const currentInstitution = useInstitutionStore((state) => state.currentInstitution);

  React.useEffect(() => {
    const routeRole = getRouteRole(pathname);
    if (
      !routeRole ||
      !session ||
      (session.role === routeRole && session.institutionId === currentInstitution.id)
    ) {
      return;
    }

    // A direct URL or refresh must agree with the role stored in the session
    setSession(
      authApiService.createPortalSession(
        { ...session, institutionId: currentInstitution.id },
        routeRole,
      ),
    );
  }, [currentInstitution.id, pathname, session, setSession]);
}
