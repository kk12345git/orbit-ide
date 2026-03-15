import { create } from 'zustand'

interface UIState {
  sidebarOpen: boolean
  aiPanelOpen: boolean
  terminalOpen: boolean
  settingsOpen: boolean
  findReplaceOpen: boolean
  activeBottomTab: 'explorer' | 'editor' | 'ai' | 'terminal'
  isOnline: boolean

  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
  setAIPanelOpen: (open: boolean) => void
  toggleAIPanel: () => void
  setTerminalOpen: (open: boolean) => void
  toggleTerminal: () => void
  setSettingsOpen: (open: boolean) => void
  setFindReplaceOpen: (open: boolean) => void
  setActiveBottomTab: (tab: UIState['activeBottomTab']) => void
  setIsOnline: (online: boolean) => void
}

export const useUIStore = create<UIState>((set, get) => ({
  sidebarOpen: true,
  aiPanelOpen: false,
  terminalOpen: false,
  settingsOpen: false,
  findReplaceOpen: false,
  activeBottomTab: 'explorer',
  isOnline: navigator.onLine,

  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setAIPanelOpen: (aiPanelOpen) => set({ aiPanelOpen }),
  toggleAIPanel: () => set((s) => ({ aiPanelOpen: !s.aiPanelOpen })),
  setTerminalOpen: (terminalOpen) => set({ terminalOpen }),
  toggleTerminal: () => set((s) => ({ terminalOpen: !s.terminalOpen })),
  setSettingsOpen: (settingsOpen) => set({ settingsOpen }),
  setFindReplaceOpen: (findReplaceOpen) => set({ findReplaceOpen }),
  setActiveBottomTab: (activeBottomTab) => set({ activeBottomTab }),
  setIsOnline: (isOnline) => set({ isOnline }),
}))
