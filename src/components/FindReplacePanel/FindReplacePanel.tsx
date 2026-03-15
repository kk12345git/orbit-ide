import { useState, useEffect, useRef, useCallback } from 'react'
import { useUIStore } from '../../stores/uiStore'
import { useEditorStore } from '../../stores/editorStore'
import styles from './FindReplacePanel.module.css'

export default function FindReplacePanel() {
  const findReplaceOpen = useUIStore(s => s.findReplaceOpen)
  const setFindReplaceOpen = useUIStore(s => s.setFindReplaceOpen)
  const activeTabId = useEditorStore(s => s.activeTabId)
  const openTabs = useEditorStore(s => s.openTabs)
  const fileContents = useEditorStore(s => s.fileContents)
  const setContent = useEditorStore(s => s.setContent)
  const markDirty = useEditorStore(s => s.markDirty)

  const [findVal, setFindVal] = useState('')
  const [replaceVal, setReplaceVal] = useState('')
  const [caseSensitive, setCaseSensitive] = useState(false)
  const [useRegex, setUseRegex] = useState(false)
  const [matchCount, setMatchCount] = useState(0)
  const findRef = useRef<HTMLInputElement>(null)

  const activeTab = openTabs.find(t => t.id === activeTabId)
  const content = activeTab ? (fileContents[activeTab.filePath] ?? '') : ''

  // Count matches
  useEffect(() => {
    if (!findVal) { setMatchCount(0); return }
    try {
      const flags = caseSensitive ? 'g' : 'gi'
      const pattern = useRegex ? findVal : findVal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const regex = new RegExp(pattern, flags)
      const matches = content.match(regex)
      setMatchCount(matches?.length ?? 0)
    } catch {
      setMatchCount(0)
    }
  }, [findVal, content, caseSensitive, useRegex])

  const handleReplace = useCallback(() => {
    if (!activeTab || !findVal) return
    try {
      const flags = caseSensitive ? 'g' : 'gi'
      const pattern = useRegex ? findVal : findVal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const regex = new RegExp(pattern, flags)
      const newContent = content.replace(regex, replaceVal)
      setContent(activeTab.filePath, newContent)
      markDirty(activeTab.filePath, true)
    } catch {
      // Invalid regex — suppress
    }
  }, [activeTab, findVal, replaceVal, caseSensitive, useRegex, content, setContent, markDirty])

  // Focus on open
  useEffect(() => {
    if (findReplaceOpen) {
      setTimeout(() => findRef.current?.focus(), 50)
    }
  }, [findReplaceOpen])

  if (!findReplaceOpen) return null

  return (
    <div className={styles.panel}>
      <div className={styles.row}>
        <input
          ref={findRef}
          className={styles.input}
          placeholder="Find…"
          value={findVal}
          onChange={e => setFindVal(e.target.value)}
          onKeyDown={e => { if (e.key === 'Escape') setFindReplaceOpen(false) }}
        />
        <button
          className={`${styles.toggleBtn} ${caseSensitive ? styles.active : ''}`}
          onClick={() => setCaseSensitive(v => !v)}
          title="Case sensitive"
        >Aa</button>
        <button
          className={`${styles.toggleBtn} ${useRegex ? styles.active : ''}`}
          onClick={() => setUseRegex(v => !v)}
          title="Regular expression"
        >.*</button>
        {findVal && <span className={styles.count}>{matchCount} match{matchCount !== 1 ? 'es' : ''}</span>}
      </div>
      <div className={styles.row}>
        <input
          className={styles.input}
          placeholder="Replace with…"
          value={replaceVal}
          onChange={e => setReplaceVal(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleReplace() }}
        />
        <button className={styles.replaceBtn} onClick={handleReplace} disabled={!findVal}>
          Replace All
        </button>
        <button className={styles.closeBtn} onClick={() => setFindReplaceOpen(false)}>✕</button>
      </div>
    </div>
  )
}
