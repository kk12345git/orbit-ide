import { useEffect, useRef } from 'react'
import { useEditorStore } from '../../stores/editorStore'
import { useUIStore } from '../../stores/uiStore'
import styles from './TabBar.module.css'

const LANG_ICONS: Record<string, string> = {
  javascript: '📜', jsx: '⚛️', typescript: '🔷', tsx: '⚛️',
  python: '🐍', css: '🎨', scss: '🎨', html: '🌐',
  json: '📋', markdown: '📝', sql: '🗄️', bash: '🖥️',
  rust: '🦀', go: '🐹', text: '📄',
}

export default function TabBar() {
  const { openTabs, activeTabId, closeTab, setActiveTab, pinTab } = useEditorStore()
  const setFindReplaceOpen = useUIStore(s => s.setFindReplaceOpen)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Keyboard shortcuts: Ctrl+W, Ctrl+Tab
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'w') {
        e.preventDefault()
        if (activeTabId) closeTab(activeTabId)
      }
      if (e.ctrlKey && e.key === 'Tab') {
        e.preventDefault()
        if (openTabs.length < 2) return
        const idx = openTabs.findIndex(t => t.id === activeTabId)
        const next = openTabs[(idx + (e.shiftKey ? -1 : 1) + openTabs.length) % openTabs.length]
        setActiveTab(next.id)
      }
      if (e.ctrlKey && e.key === 'f') {
        e.preventDefault()
        setFindReplaceOpen(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeTabId, openTabs, closeTab, setActiveTab, setFindReplaceOpen])

  // Scroll active tab into view
  useEffect(() => {
    const activeEl = scrollRef.current?.querySelector(`.${styles.active}`) as HTMLElement
    activeEl?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  }, [activeTabId])

  if (openTabs.length === 0) return null

  return (
    <div className={styles.tabBar} ref={scrollRef}>
      {openTabs.map(tab => (
        <div
          key={tab.id}
          className={[
            styles.tab,
            tab.id === activeTabId ? styles.active : '',
            tab.isPinned ? styles.pinned : '',
          ].filter(Boolean).join(' ')}
          onClick={() => setActiveTab(tab.id)}
          onDoubleClick={() => pinTab(tab.id)}
          title={`${tab.filePath}${tab.isPinned ? ' (pinned)' : ''}`}
        >
          <span className={styles.icon}>{LANG_ICONS[tab.language] ?? '📄'}</span>
          <span className={styles.tabName}>{tab.name}</span>
          {tab.isDirty && <span className={styles.dirtyDot} title="Unsaved changes" />}
          {!tab.isPinned && (
            <button
              className={styles.closeBtn}
              onClick={e => { e.stopPropagation(); closeTab(tab.id) }}
              title="Close tab (Ctrl+W)"
            >✕</button>
          )}
        </div>
      ))}
    </div>
  )
}
