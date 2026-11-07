import { create } from 'zustand';
import { Institution } from '@/types/institution';
import { DEFAULT_INSTITUTIONS } from '@/lib/constants/institutions';
import { STORAGE_KEYS } from '@/lib/constants/storage-keys';
import { applyInstitutionTheme } from '@/lib/utils/theme';

interface InstitutionStoreState {
  currentInstitution: Institution;
  institutions: Institution[];
  isHydrated: boolean;
  setInstitution: (id: string) => void;
  updateCurrentInstitution: (data: Partial<Institution>) => void;
  initializeFromStorage: () => void;
}

export const useInstitutionStore = create<InstitutionStoreState>((set, get) => ({
  currentInstitution: DEFAULT_INSTITUTIONS[0],
  institutions: [...DEFAULT_INSTITUTIONS],
  isHydrated: false,

  setInstitution: (id: string) => {
    const { institutions } = get();
    const found = institutions.find((b) => b.id === id) || institutions[0];
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.CURRENT_INSTITUTION, found.id);
    }
    applyInstitutionTheme(found);
    set({ currentInstitution: found });
  },

  updateCurrentInstitution: (data) => {
    // Settings are persisted by the service before this updates the shared theme
    const { currentInstitution, institutions } = get();
    const updated: Institution = { ...currentInstitution, ...data };
    const updatedList = institutions.map((b) => (b.id === updated.id ? updated : b));
    applyInstitutionTheme(updated);
    set({ currentInstitution: updated, institutions: updatedList });
  },

  initializeFromStorage: () => {
    if (typeof window === 'undefined') return;

    try {
      const activeId = localStorage.getItem(STORAGE_KEYS.CURRENT_INSTITUTION);
      const rawDb = localStorage.getItem(STORAGE_KEYS.DB_STORE);
      let list = [...DEFAULT_INSTITUTIONS];

      if (rawDb) {
        const parsed = JSON.parse(rawDb);
        if (Array.isArray(parsed?.institutions) && parsed.institutions.length > 0) {
          const isLegacySchema = (parsed?.schemaVersion ?? 1) < 2;
          list = parsed.institutions.map((inst: Institution) => {
            const fallback = DEFAULT_INSTITUTIONS.find((item) => item.id === inst.id);
            return {
              ...inst,
              // Current records may intentionally have no logo; only older records need a default
              logo: isLegacySchema ? inst.logo || fallback?.logo || '' : (inst.logo ?? ''),
            };
          });
        }
      }

      const active = list.find((b) => b.id === activeId) || list[0];
      applyInstitutionTheme(active);
      set({ currentInstitution: active, institutions: list, isHydrated: true });
    } catch {
      // Invalid saved settings fall back to the default theme
      applyInstitutionTheme(DEFAULT_INSTITUTIONS[0]);
      set({ isHydrated: true });
    }
  },
}));
