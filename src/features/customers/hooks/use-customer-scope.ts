'use client';

import { useAuthStore } from '@/store/auth-store';
import { useInstitutionStore } from '@/store/institution-store';

export function useCustomerScope() {
  const institution = useInstitutionStore((state) => state.currentInstitution);
  const session = useAuthStore((state) => state.session);

  // Use this institution's first borrower if the session has no matching customer
  const belongsToInstitution = session?.customerId?.startsWith(`${institution.id}-`) ?? false;
  const customerId = belongsToInstitution
    ? (session?.customerId as string)
    : `${institution.id}-cus-1`;

  return { institution, customerId, session };
}
