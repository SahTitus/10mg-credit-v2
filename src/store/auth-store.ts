import { create } from 'zustand';
import { UserSession } from '@/types/auth';
import { STORAGE_KEYS } from '@/lib/constants/storage-keys';

interface AuthStoreState {
  session: UserSession | null;
  isLoading: boolean;
  isSigningOut: boolean;
  setSession: (session: UserSession | null) => void;
  setIsSigningOut: (isSigningOut: boolean) => void;
  clearSession: () => void;
  initializeFromStorage: () => void;
}

export const useAuthStore = create<AuthStoreState>((set) => ({
  session: null,
  // Start in a loading state until saved session data has been checked in the browser
  isLoading: true,
  isSigningOut: false,

  setSession: (session) => {
    if (typeof window !== 'undefined') {
      if (session) {
        localStorage.setItem(STORAGE_KEYS.USER_SESSION, JSON.stringify(session));
      } else {
        localStorage.removeItem(STORAGE_KEYS.USER_SESSION);
      }
    }
    set({ session, isLoading: false, isSigningOut: false });
  },

  setIsSigningOut: (isSigningOut) => set({ isSigningOut }),

  clearSession: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.USER_SESSION);
    }
    set({ session: null, isLoading: false, isSigningOut: false });
  },

  initializeFromStorage: () => {
    if (typeof window === 'undefined') {
      set({ isLoading: false });
      return;
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.USER_SESSION);
      const session: UserSession | null = raw ? JSON.parse(raw) : null;
      set({ session, isLoading: false });
    } catch {
      // Ignore unreadable storage entries and fall back to a signed-out state
      set({ session: null, isLoading: false });
    }
  },
}));
