import { beforeEach, describe, expect, it } from 'vitest';
import { DEFAULT_INSTITUTIONS } from '@/lib/constants/institutions';
import { STORAGE_KEYS } from '@/lib/constants/storage-keys';
import { useAuthStore } from '@/store/auth-store';
import { useInstitutionStore } from '@/store/institution-store';
import { useUIStore } from '@/store/ui-store';

describe('Zustand Client Stores', () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.setState({
      session: null,
      isLoading: true,
      isSigningOut: false,
    });
    useInstitutionStore.setState({
      currentInstitution: DEFAULT_INSTITUTIONS[0],
      institutions: [...DEFAULT_INSTITUTIONS],
      isHydrated: false,
    });
    useUIStore.setState({
      isNotificationDrawerOpen: false,
      isMobileSidebarOpen: false,
      isSidebarCollapsed: false,
      globalSearch: '',
      activeStatusTab: 'All',
    });
  });

  it('persists, hydrates, and clears authentication sessions via useAuthStore', () => {
    const sampleSession = {
      id: 'usr-101',
      name: 'Amina Yusuf',
      email: 'ayusuf@aminapharmacy.ng',
      role: 'customer' as const,
      institutionId: 'bluehaven',
      customerId: 'bluehaven-cus-1',
      business: 'Amina Pharmacy',
    };

    useAuthStore.getState().setSession(sampleSession);
    expect(useAuthStore.getState().session).toEqual(sampleSession);
    expect(useAuthStore.getState().isLoading).toBe(false);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_SESSION) ?? 'null')).toEqual(
      sampleSession,
    );

    useAuthStore.setState({ session: null, isLoading: true });
    useAuthStore.getState().initializeFromStorage();
    expect(useAuthStore.getState().session).toEqual(sampleSession);
    expect(useAuthStore.getState().isLoading).toBe(false);

    useAuthStore.getState().clearSession();
    expect(useAuthStore.getState().session).toBeNull();
    expect(localStorage.getItem(STORAGE_KEYS.USER_SESSION)).toBeNull();
  });

  it('switches institutions, updates CSS variables, and hydrates persisted branding via useInstitutionStore', () => {
    useInstitutionStore.getState().setInstitution('meridian');

    expect(useInstitutionStore.getState().currentInstitution.id).toBe('meridian');
    expect(localStorage.getItem(STORAGE_KEYS.CURRENT_INSTITUTION)).toBe('meridian');
    expect(document.documentElement.style.getPropertyValue('--brand')).toBe(
      DEFAULT_INSTITUTIONS[1].primary,
    );

    useInstitutionStore.getState().updateCurrentInstitution({
      name: 'Meridian Health Partners',
      logo: '',
    });
    expect(useInstitutionStore.getState().currentInstitution.name).toBe('Meridian Health Partners');
    expect(useInstitutionStore.getState().currentInstitution.logo).toBe('');

    localStorage.setItem(
      STORAGE_KEYS.DB_STORE,
      JSON.stringify({
        schemaVersion: 2,
        institutions: useInstitutionStore.getState().institutions,
      }),
    );

    useInstitutionStore.setState({
      currentInstitution: DEFAULT_INSTITUTIONS[0],
      isHydrated: false,
    });
    useInstitutionStore.getState().initializeFromStorage();

    expect(useInstitutionStore.getState().isHydrated).toBe(true);
    expect(useInstitutionStore.getState().currentInstitution.id).toBe('meridian');
    expect(useInstitutionStore.getState().currentInstitution.logo).toBe('');
  });

  it('toggles sidebar collapse and drawers via useUIStore', () => {
    expect(useUIStore.getState().isSidebarCollapsed).toBe(false);
    useUIStore.getState().toggleSidebarCollapsed();
    expect(useUIStore.getState().isSidebarCollapsed).toBe(true);

    useUIStore.getState().setNotificationDrawerOpen(true);
    expect(useUIStore.getState().isNotificationDrawerOpen).toBe(true);

    useUIStore.getState().setMobileSidebarOpen(true);
    expect(useUIStore.getState().isMobileSidebarOpen).toBe(true);
  });
});
