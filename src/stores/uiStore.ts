import { create } from 'zustand';

interface UIState {
  isSidebarOpen: boolean;
  activeTab: 'files' | 'editor' | 'ai' | 'terminal' | 'preview';
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setActiveTab: (tab: 'files' | 'editor' | 'ai' | 'terminal' | 'preview') => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarOpen: true,
  activeTab: 'editor',
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),
  setActiveTab: (tab) => set({ activeTab: tab }),
}));
