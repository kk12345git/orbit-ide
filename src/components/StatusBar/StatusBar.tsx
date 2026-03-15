import { useEditorStore } from '../../stores/editorStore'
import { useSettingsStore } from '../../stores/settingsStore'
import { useUIStore } from '../../stores/uiStore'
import styles from './StatusBar.module.css'

const LANG_LABELS: Record<string, string> = {
  javascript: 'JavaScript', jsx: 'JSX', typescript: 'TypeScript', tsx: 'TSX',
  python: 'Python', css: 'CSS', scss: 'SCSS', html: 'HTML',
  json: 'JSON', markdown: 'Markdown', sql: 'SQL', bash: 'Bash',
  rust: 'Rust', go: 'Go', text: 'Plain Text',
}

export default function StatusBar() {
  const openTabs = useEditorStore(s => s.openTabs)
  const activeTabId = useEditorStore(s => s.activeTabId)
  const cursorLine = useEditorStore(s => s.cursorLine)
  const cursorCol = useEditorStore(s => s.cursorCol)
  const { theme, tabSize, wordWrap, toggleTheme, toggleWordWrap } = useSettingsStore()
  const isOnline = useUIStore(s => s.isOnline)
  const toggleTerminal = useUIStore(s => s.toggleTerminal)
  const toggleAIPanel = useUIStore(s => s.toggleAIPanel)

  const activeTab = openTabs.find(t => t.id === activeTabId)
  const language = activeTab?.language ?? 'text'
  const isDirty = activeTab?.isDirty ?? false

  return (
    <div className={styles.statusBar} data-theme-override={theme === 'light' ? 'light-bar' : undefined}>
      {/* Left side */}
      <div className={styles.left}>
        {!isOnline && <span className={styles.offline} title="You are offline — AI unavailable">⚡ Offline</span>}
        {activeTab && (
          <span className={styles.item} title="Current file">
            {activeTab.name}{isDirty ? ' •' : ''}
          </span>
        )}
      </div>

      {/* Right side */}
      <div className={styles.right}>
        {activeTab && (
          <span className={styles.item} title="Cursor position">
            Ln {cursorLine}, Col {cursorCol}
          </span>
        )}
        {activeTab && (
          <span className={styles.item} title="Language">
            {LANG_LABELS[language] ?? language}
          </span>
        )}
        <button className={styles.btn} onClick={toggleWordWrap} title="Toggle word wrap">
          {wordWrap ? 'Wrap: On' : 'Wrap: Off'}
        </button>
        <span className={styles.item} title="Tab size">
          Spaces: {tabSize}
        </span>
        <button className={styles.btn} onClick={toggleTheme} title="Toggle theme">
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        <button className={styles.btn} onClick={toggleAIPanel} title="Toggle AI panel (Ctrl+I)">
          🤖 AI
        </button>
        <button className={styles.btn} onClick={toggleTerminal} title="Toggle terminal (Ctrl+`)">
          &gt;_
        </button>
      </div>
    </div>
  )
}
