import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Tab {
  id: string
  filePath: string
  name: string
  language: string
  isPinned: boolean
  isDirty: boolean
}

interface EditorState {
  openTabs: Tab[]
  activeTabId: string | null
  fileContents: Record<string, string>   // filePath → content
  cursorLine: number
  cursorCol: number
  selection: string
  history: Record<string, { past: string[], future: string[] }>

  // Actions
  openTab: (filePath: string, name: string, language: string, content: string) => void
  closeTab: (tabId: string) => void
  setActiveTab: (tabId: string) => void
  setContent: (filePath: string, content: string) => void
  markDirty: (filePath: string, dirty: boolean) => void
  pinTab: (tabId: string) => void
  setCursor: (line: number, col: number) => void
  setSelection: (text: string) => void
  reorderTabs: (fromIndex: number, toIndex: number) => void
  pushHistory: (filePath: string, content: string) => void
  undo: (filePath: string) => string | null
  redo: (filePath: string) => string | null
}

export const useEditorStore = create<EditorState>()(
  persist(
    (set, get) => ({
      openTabs: [],
      activeTabId: null,
      fileContents: {},
      cursorLine: 1,
      cursorCol: 1,
      selection: '',
      history: {},

      openTab: (filePath, name, language, content) => {
        const existing = get().openTabs.find(t => t.filePath === filePath)
        if (existing) {
          set({ activeTabId: existing.id })
          return
        }
        const id = `tab-${Date.now()}-${Math.random().toString(36).slice(2)}`
        const tab: Tab = { id, filePath, name, language, isPinned: false, isDirty: false }
        set(s => ({
          openTabs: [...s.openTabs, tab],
          activeTabId: id,
          fileContents: { ...s.fileContents, [filePath]: content }
        }))
      },

      closeTab: (tabId) => {
        const { openTabs, activeTabId } = get()
        const idx = openTabs.findIndex(t => t.id === tabId)
        const next = openTabs.filter(t => t.id !== tabId)
        let nextActive = activeTabId
        if (activeTabId === tabId) {
          const newActive = next[Math.min(idx, next.length - 1)]
          nextActive = newActive?.id ?? null
        }
        set({ openTabs: next, activeTabId: nextActive })
      },

      setActiveTab: (tabId) => set({ activeTabId: tabId }),

      setContent: (filePath, content) =>
        set(s => ({ fileContents: { ...s.fileContents, [filePath]: content } })),

      markDirty: (filePath, dirty) =>
        set(s => ({
          openTabs: s.openTabs.map(t =>
            t.filePath === filePath ? { ...t, isDirty: dirty } : t
          )
        })),

      pinTab: (tabId) =>
        set(s => ({
          openTabs: s.openTabs.map(t =>
            t.id === tabId ? { ...t, isPinned: !t.isPinned } : t
          )
        })),

      setCursor: (cursorLine, cursorCol) => set({ cursorLine, cursorCol }),
      setSelection: (selection) => set({ selection }),

      reorderTabs: (fromIndex, toIndex) => {
        const tabs = [...get().openTabs]
        const [moved] = tabs.splice(fromIndex, 1)
        tabs.splice(toIndex, 0, moved)
        set({ openTabs: tabs })
      },

      pushHistory: (filePath, content) => {
        set(s => {
          const fileHistory = s.history[filePath] ?? { past: [], future: [] }
          if (fileHistory.past[fileHistory.past.length - 1] === content) {
            return s
          }
          return {
            history: {
              ...s.history,
              [filePath]: {
                past: [...fileHistory.past, content],
                future: []
              }
            }
          }
        })
      },

      undo: (filePath) => {
        let prevContent: string | null = null
        set(s => {
          const fileHistory = s.history[filePath] ?? { past: [], future: [] }
          if (fileHistory.past.length === 0) return s
          
          const newPast = [...fileHistory.past]
          const currentContent = s.fileContents[filePath] || ''
          const target = newPast.pop()!
          prevContent = target
          
          return {
            history: {
              ...s.history,
              [filePath]: {
                past: newPast,
                future: [currentContent, ...fileHistory.future]
              }
            },
            fileContents: {
              ...s.fileContents,
              [filePath]: target
            }
          }
        })
        return prevContent
      },

      redo: (filePath) => {
        let nextContent: string | null = null
        set(s => {
          const fileHistory = s.history[filePath] ?? { past: [], future: [] }
          if (fileHistory.future.length === 0) return s
          
          const newFuture = [...fileHistory.future]
          const currentContent = s.fileContents[filePath] || ''
          const target = newFuture.shift()!
          nextContent = target
          
          return {
            history: {
              ...s.history,
              [filePath]: {
                past: [...fileHistory.past, currentContent],
                future: newFuture
              }
            },
            fileContents: {
              ...s.fileContents,
              [filePath]: target
            }
          }
        })
        return nextContent
      },
    }),
    {
      name: 'orbit-editor-tabs',
      partialize: (state) => ({
        openTabs: state.openTabs,
        activeTabId: state.activeTabId,
      }),
    }
  )
)
