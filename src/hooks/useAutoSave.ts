import { useEffect, useRef, useCallback } from 'react'
import { updateFile } from '@/db/schema'
import { useEditorStore } from '@/stores/editorStore'

/**
 * Auto-saves the current file to IndexedDB every 30 seconds.
 * Also saves on blur (when switching tabs/windows).
 * Marks the tab as clean when saved.
 */
export function useAutoSave(filePath: string | null) {
  const content = useEditorStore(s => filePath ? s.fileContents[filePath] : undefined)
  const markDirty = useEditorStore(s => s.markDirty)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastSavedRef = useRef<string>('')

  const save = useCallback(async () => {
    if (!filePath || content === undefined) return
    if (content === lastSavedRef.current) return  // no change
    try {
      await updateFile(filePath, content)
      lastSavedRef.current = content
      markDirty(filePath, false)
    } catch (err) {
      console.error('[AutoSave] failed:', err)
    }
  }, [filePath, content, markDirty])

  // 30-second periodic save
  useEffect(() => {
    timerRef.current = setInterval(save, 30_000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [save])

  // Save on page/tab visibility change (blur)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') void save()
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [save])

  // Manual save — exposed so CodeEditor can call on Ctrl+S
  return { save }
}
