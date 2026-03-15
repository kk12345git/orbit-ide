import { useEffect, useRef, useState } from 'react'
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
  const { openTabs, activeTabId, closeTab, setActiveTab, pinTab, reorderTabs } = useEditorStore()
  const setFindReplaceOpen = useUIStore(s => s.setFindReplaceOpen)
  const scrollRef = useRef<HTMLDivElement>(null)

  const [draggedIdx, setDraggedIdx] = useState<number | null>(null)
  const [dropIdx, setDropIdx] = useState<number | null>(null)
  const [dropSide, setDropSide] = useState<'left' | 'right' | null>(null)

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

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIdx(index)
    e.dataTransfer.effectAllowed = 'move'
    // Visual ghost is automatic with native DnD
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIdx === null || draggedIdx === index) {
      setDropIdx(null)
      return
    }

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const midpoint = rect.left + rect.width / 2
    const side = e.clientX < midpoint ? 'left' : 'right'
    
    setDropIdx(index)
    setDropSide(side)
  }

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIdx === null || draggedIdx === index) return
    
    // Determine final index
    let targetIdx = index
    // Note: reorderTabs in store handles splice logic
    reorderTabs(draggedIdx, targetIdx)
    
    setDraggedIdx(null)
    setDropIdx(null)
    setDropSide(null)
  }

  const handleDragEnd = () => {
    setDraggedIdx(null)
    setDropIdx(null)
    setDropSide(null)
  }

  if (openTabs.length === 0) return null

  return (
    <div className={styles.tabBar} ref={scrollRef}>
      {openTabs.map((tab, idx) => {
        const isDropTarget = dropIdx === idx
        const dropClass = isDropTarget 
          ? (dropSide === 'left' ? styles.dropTargetLeft : styles.dropTargetRight)
          : ''

        return (
          <div
            key={tab.id}
            draggable
            className={[
              styles.tab,
              tab.id === activeTabId ? styles.active : '',
              tab.isPinned ? styles.pinned : '',
              draggedIdx === idx ? styles.dragging : '',
              dropClass,
            ].filter(Boolean).join(' ')}
            onClick={() => setActiveTab(tab.id)}
            onDoubleClick={() => pinTab(tab.id)}
            onDragStart={(e) => handleDragStart(e, idx)}
            onDragOver={(e) => handleDragOver(e, idx)}
            onDrop={(e) => handleDrop(e, idx)}
            onDragEnd={handleDragEnd}
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
        )
      })}
    </div>
  )
}
