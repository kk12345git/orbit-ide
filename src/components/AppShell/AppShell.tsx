import { useEffect, useRef } from 'react'
import { useUIStore } from '../../stores/uiStore'
import { useEditorStore } from '../../stores/editorStore'
import FileExplorer from '../FileExplorer/FileExplorer'
import TabBar from '../TabBar/TabBar'
import CodeEditor from '../Editor/CodeEditor'
import StatusBar from '../StatusBar/StatusBar'
import AIPanel from '../AIPanel/AIPanel'
import Terminal from '../Terminal/Terminal'
import MobileBottomNav from '../MobileBottomNav/MobileBottomNav'
import SettingsPanel from '../SettingsPanel/SettingsPanel'
import FindReplacePanel from '../FindReplacePanel/FindReplacePanel'
import styles from './AppShell.module.css'

export default function AppShell() {
  const { sidebarOpen, aiPanelOpen, terminalOpen, settingsOpen } = useUIStore()
  const setSidebarOpen = useUIStore(s => s.setSidebarOpen)
  const activeTabId = useEditorStore(s => s.activeTabId)
  const openTabs = useEditorStore(s => s.openTabs)
  const activeTab = openTabs.find(t => t.id === activeTabId)

  // Swipe gesture for sidebar on mobile
  const touchStartX = useRef(0)
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX
    }
    const handleTouchEnd = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - touchStartX.current
      if (Math.abs(dx) < 60) return
      if (dx > 0 && touchStartX.current < 40) setSidebarOpen(true)   // swipe right from edge
      if (dx < 0 && sidebarOpen) setSidebarOpen(false)               // swipe left
    }
    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchend', handleTouchEnd, { passive: true })
    return () => {
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [sidebarOpen, setSidebarOpen])

  const shellClass = [styles.shell, aiPanelOpen ? styles.aiOpen : ''].filter(Boolean).join(' ')

  return (
    <div className={shellClass}>
      {/* Sidebar */}
      <aside className={`${styles.sidebarArea} ${sidebarOpen ? styles.open : ''}`}>
        <FileExplorer />
      </aside>

      {/* Main editor area */}
      <main className={styles.mainArea}>
        <TabBar />
        {activeTab ? (
          <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
            <CodeEditor
              filePath={activeTab.filePath}
              language={activeTab.language}
            />
            <FindReplacePanel />
          </div>
        ) : (
          <WelcomeScreen />
        )}
      </main>

      {/* Terminal */}
      {terminalOpen && (
        <div className={styles.terminalArea}>
          <Terminal />
        </div>
      )}

      {/* AI Panel */}
      {aiPanelOpen && (
        <aside className={styles.aiArea}>
          <AIPanel />
        </aside>
      )}

      {/* Status Bar */}
      <div className={styles.statusArea}>
        <StatusBar />
      </div>

      {/* Settings modal */}
      {settingsOpen && <SettingsPanel />}

      {/* Mobile bottom nav */}
      <MobileBottomNav />
    </div>
  )
}

function WelcomeScreen() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      gap: '1rem',
      color: 'var(--color-text-muted)',
      userSelect: 'none',
    }}>
      <span style={{ fontSize: '3rem' }}>🛸</span>
      <h2 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--color-text-primary)' }}>ORBIT IDE</h2>
      <p style={{ margin: 0, fontSize: '0.9rem' }}>Open a file from the Explorer to start coding</p>
      <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.6 }}>Zero-Gravity Coding — Anywhere, Any Device</p>
    </div>
  )
}
