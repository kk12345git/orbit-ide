import { useEffect, useRef } from 'react'
import { useEditorStore } from '../stores/editorStore'
import { useSettingsStore } from '../stores/settingsStore'
import { useUIStore } from '../stores/uiStore'
import { ensureDefaultProject, listFiles } from '../db/schema'
import AppShell from './AppShell/AppShell'

export default function App() {
  const openTab = useEditorStore(s => s.openTab)
  const setIsOnline = useUIStore(s => s.setIsOnline)
  const theme = useSettingsStore(s => s.theme)
  const initialized = useRef(false)

  // Apply theme to <html>
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  // Online/offline listener
  useEffect(() => {
    const onOnline = () => setIsOnline(true)
    const onOffline = () => setIsOnline(false)
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [setIsOnline])

  // Load default project on first mount
  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    ;(async () => {
      try {
        const { projectId, activeFilePath } = await ensureDefaultProject()
        const files = await listFiles(projectId)
        // Open the active file (and welcome project files)
        for (const f of files) {
          if (f.path === activeFilePath) {
            openTab(f.path, f.name, f.language, f.content)
          }
        }
      } catch (err) {
        console.error('[ORBIT] Failed to load default project', err)
      }
    })()
  }, [openTab])

  // Global keyboard shortcuts
  useEffect(() => {
    const ui = useUIStore.getState()
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      const isEditor = target.tagName === 'TEXTAREA'

      // Ctrl+I — toggle AI
      if (e.ctrlKey && e.key === 'i' && !isEditor) {
        e.preventDefault()
        ui.toggleAIPanel()
      }
      // Ctrl+` — toggle terminal
      if (e.ctrlKey && e.key === '`') {
        e.preventDefault()
        ui.toggleTerminal()
      }
      // Ctrl+Shift+P — settings
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        e.preventDefault()
        ui.setSettingsOpen(!ui.settingsOpen)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return <AppShell />
}
