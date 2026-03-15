import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Theme = 'dark' | 'light'
export type ColorScheme = 'github-dark' | 'github-light' | 'dracula' | 'solarized' | 'monokai' | 'high-contrast'
export type EditorFont = 'jetbrains-mono' | 'fira-code' | 'cascadia-code' | 'system'
export type TabSize = 2 | 4

interface SettingsState {
  theme: Theme
  colorScheme: ColorScheme
  editorFont: EditorFont
  fontSize: number
  tabSize: TabSize
  wordWrap: boolean
  // Actions
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  setColorScheme: (scheme: ColorScheme) => void
  setEditorFont: (font: EditorFont) => void
  setFontSize: (size: number) => void
  setTabSize: (size: TabSize) => void
  toggleWordWrap: () => void
}

const FONT_MAP: Record<EditorFont, string> = {
  'jetbrains-mono': "'JetBrains Mono', monospace",
  'fira-code':      "'Fira Code', monospace",
  'cascadia-code':  "'Cascadia Code', monospace",
  'system':         "monospace",
}

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme)
  document.querySelector('meta[name="theme-color"]')?.setAttribute(
    'content',
    theme === 'dark' ? '#0D1117' : '#FFFFFF'
  )
}

function applyFont(font: EditorFont, size: number) {
  document.documentElement.style.setProperty('--editor-font-family', FONT_MAP[font])
  document.documentElement.style.setProperty('--editor-font-size', `${size}px`)
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      theme: (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'),
      colorScheme: 'github-dark',
      editorFont: 'jetbrains-mono',
      fontSize: 14,
      tabSize: 2,
      wordWrap: false,

      setTheme: (theme) => {
        applyTheme(theme)
        set({ theme, colorScheme: theme === 'light' ? 'github-light' : 'github-dark' })
      },

      toggleTheme: () => {
        const next = get().theme === 'dark' ? 'light' : 'dark'
        get().setTheme(next)
      },

      setColorScheme: (colorScheme) => set({ colorScheme }),

      setEditorFont: (editorFont) => {
        applyFont(editorFont, get().fontSize)
        set({ editorFont })
      },

      setFontSize: (fontSize) => {
        const clamped = Math.max(10, Math.min(24, fontSize))
        applyFont(get().editorFont, clamped)
        set({ fontSize: clamped })
      },

      setTabSize: (tabSize) => set({ tabSize }),

      toggleWordWrap: () => set((s) => ({ wordWrap: !s.wordWrap })),
    }),
    {
      name: 'orbit-settings',
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyTheme(state.theme)
          applyFont(state.editorFont, state.fontSize)
        }
      }
    }
  )
)
