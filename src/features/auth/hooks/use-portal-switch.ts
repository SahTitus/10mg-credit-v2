'use client';

import { useRouter } from 'next/navigation';
import { authApiService } from '@/lib/api/auth-service';
import { APP_ROUTES } from '@/lib/constants/routes';
import { useAuthStore } from '@/store/auth-store';
import { useInstitutionStore } from '@/store/institution-store';
import type { UserRole } from '@/types/auth';

const portalRoutes: Readonly<Record<UserRole, string>> = {
  lender: APP_ROUTES.LENDER.OVERVIEW,
  customer: APP_ROUTES.CUSTOMER.OVERVIEW,
};

export function usePortalSwitch() {
  const router = useRouter();
  const session = useAuthStore((state) => state.session);
  const setSession = useAuthStore((state) => state.setSession);
  const currentInstitution = useInstitutionStore((state) => state.currentInstitution);

  return (role: UserRole) => {
    if (!session || session.role === role) {
      router.push(portalRoutes[role]);
      return;
    }

    // Update the session first so the destination shell reads the new portal role
    setSession(
      authApiService.createPortalSession(
        { ...session, institutionId: currentInstitution.id },
        role,
      ),
    );
    router.push(portalRoutes[role]);
  };
}
