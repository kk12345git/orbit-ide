import { useUIStore } from '../../stores/uiStore'
import { useEditorStore } from '../../stores/editorStore'
import styles from './MobileBottomNav.module.css'

export default function MobileBottomNav() {
  const { sidebarOpen, aiPanelOpen, settingsOpen, terminalOpen,
    toggleSidebar, toggleAIPanel, setSettingsOpen, toggleTerminal } = useUIStore()
  const openTabs = useEditorStore(s => s.openTabs)

  return (
    <nav className={styles.nav} aria-label="Mobile navigation">
      <button
        className={`${styles.navBtn} ${sidebarOpen ? styles.active : ''}`}
        onClick={toggleSidebar}
        title="Files"
      >
        <span className={styles.icon}>📁</span>
        <span className={styles.label}>Files</span>
      </button>

      <button
        className={`${styles.navBtn} ${openTabs.length > 0 ? styles.active : ''}`}
        onClick={() => {
          useUIStore.getState().setSidebarOpen(false)
          useUIStore.getState().setAIPanelOpen(false)
        }}
        title="Editor"
      >
        <span className={styles.icon}>✏️</span>
        <span className={styles.label}>Editor</span>
      </button>

      <button
        className={`${styles.navBtn} ${aiPanelOpen ? styles.active : ''}`}
        onClick={toggleAIPanel}
        title="AI Assistant"
      >
        <span className={styles.icon}>🤖</span>
        <span className={styles.label}>AI</span>
      </button>

      <button
        className={`${styles.navBtn} ${terminalOpen ? styles.active : ''}`}
        onClick={toggleTerminal}
        title="Terminal"
      >
        <span className={styles.icon}>&gt;_</span>
        <span className={styles.label}>Term</span>
      </button>

      <button
        className={`${styles.navBtn} ${settingsOpen ? styles.active : ''}`}
        onClick={() => setSettingsOpen(!settingsOpen)}
        title="Settings"
      >
        <span className={styles.icon}>⚙️</span>
        <span className={styles.label}>Settings</span>
      </button>
    </nav>
  )
}
