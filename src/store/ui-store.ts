import { create } from 'zustand';

interface UIStoreState {
  isNotificationDrawerOpen: boolean;
  isMobileSidebarOpen: boolean;
  isSidebarCollapsed: boolean;
  globalSearch: string;
  activeStatusTab: string;
  setNotificationDrawerOpen: (open: boolean) => void;
  setMobileSidebarOpen: (open: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebarCollapsed: () => void;
  setGlobalSearch: (search: string) => void;
  setActiveStatusTab: (tab: string) => void;
}

export const useUIStore = create<UIStoreState>((set) => ({
  isNotificationDrawerOpen: false,
  isMobileSidebarOpen: false,
  isSidebarCollapsed: false,
  globalSearch: '',
  activeStatusTab: 'All',

  setNotificationDrawerOpen: (open) => set({ isNotificationDrawerOpen: open }),
  setMobileSidebarOpen: (open) => set({ isMobileSidebarOpen: open }),
  setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),
  toggleSidebarCollapsed: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  setGlobalSearch: (globalSearch) => set({ globalSearch }),
  setActiveStatusTab: (activeStatusTab) => set({ activeStatusTab }),
}));
