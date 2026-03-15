import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useEditorStore } from '../../stores/editorStore'
import { useSettingsStore } from '../../stores/settingsStore'
import { useUIStore } from '../../stores/uiStore'
import { highlightCode } from '../../utils/highlight'
import { useScrollSync } from '../../hooks/useScrollSync'
import { useAutoSave } from '../../hooks/useAutoSave'
import styles from './CodeEditor.module.css'

interface Props {
  filePath: string
  language: string
}

export default function CodeEditor({ filePath, language }: Props) {
  const fileContents = useEditorStore(s => s.fileContents)
  const setContent = useEditorStore(s => s.setContent)
  const markDirty = useEditorStore(s => s.markDirty)
  const setCursor = useEditorStore(s => s.setCursor)
  const setSelection = useEditorStore(s => s.setSelection)
  const { tabSize, wordWrap, fontSize } = useSettingsStore()
  const findReplaceOpen = useUIStore(s => s.findReplaceOpen)

  const content = fileContents[filePath] ?? ''
  const [localContent, setLocalContent] = useState(content)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const preRef = useRef<HTMLPreElement>(null)
  const gutterRef = useRef<HTMLDivElement>(null)
  const codeAreaRef = useRef<HTMLDivElement>(null)
  const [activeLine, setActiveLine] = useState(1)

  // Sync localContent when filePath changes
  useEffect(() => {
    setLocalContent(fileContents[filePath] ?? '')
  }, [filePath, fileContents])

  // Scroll sync: textarea → pre overlay (pixel-perfect)
  useScrollSync(textareaRef, preRef)

  // Sync gutter scroll with codeArea scroll
  useEffect(() => {
    const codeArea = codeAreaRef.current
    const gutter = gutterRef.current
    if (!codeArea || !gutter) return
    const syncGutter = () => { gutter.scrollTop = codeArea.scrollTop }
    // The textarea fires scroll; mirror it to gutter
    const ta = codeArea.querySelector('textarea')
    if (ta) {
      ta.addEventListener('scroll', syncGutter, { passive: true })
      return () => ta.removeEventListener('scroll', syncGutter)
    }
  }, [])

  // Auto-save
  useAutoSave(filePath)

  // Debounced highlight (100ms)
  const highlighted = useMemo(() => {
    return highlightCode(localContent, language) + '\n' // trailing newline keeps height consistent
  }, [localContent, language])

  const lineCount = useMemo(() => {
    const count = (localContent.match(/\n/g) ?? []).length + 1
    return count
  }, [localContent])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    setLocalContent(val)
    setContent(filePath, val)
    markDirty(filePath, true)
  }, [filePath, setContent, markDirty])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const ta = e.currentTarget
    const { selectionStart, selectionEnd, value } = ta

    // Tab key — insert spaces
    if (e.key === 'Tab') {
      e.preventDefault()
      const spaces = ' '.repeat(tabSize)
      if (selectionStart === selectionEnd) {
        // Single cursor: insert spaces
        const newVal = value.slice(0, selectionStart) + spaces + value.slice(selectionEnd)
        setLocalContent(newVal)
        setContent(filePath, newVal)
        markDirty(filePath, true)
        requestAnimationFrame(() => {
          ta.selectionStart = selectionStart + tabSize
          ta.selectionEnd = selectionStart + tabSize
        })
      } else {
        // Block indent: indent all lines in selection
        const before = value.slice(0, selectionStart)
        const selected = value.slice(selectionStart, selectionEnd)
        const after = value.slice(selectionEnd)
        const indented = e.shiftKey
          ? selected.replace(new RegExp(`^ {1,${tabSize}}`, 'gm'), '')
          : selected.replace(/^/gm, spaces)
        const newVal = before + indented + after
        setLocalContent(newVal)
        setContent(filePath, newVal)
        markDirty(filePath, true)
        requestAnimationFrame(() => {
          ta.selectionStart = selectionStart
          ta.selectionEnd = selectionStart + indented.length
        })
      }
    }

    // Enter — auto-indent
    if (e.key === 'Enter') {
      e.preventDefault()
      const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1
      const currentLine = value.slice(lineStart, selectionStart)
      const indentMatch = currentLine.match(/^(\s*)/)
      const indent = indentMatch ? indentMatch[1] : ''
      const newVal = value.slice(0, selectionStart) + '\n' + indent + value.slice(selectionEnd)
      setLocalContent(newVal)
      setContent(filePath, newVal)
      markDirty(filePath, true)
      const newPos = selectionStart + 1 + indent.length
      requestAnimationFrame(() => {
        ta.selectionStart = newPos
        ta.selectionEnd = newPos
      })
    }

    // Ctrl+S — manual save
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault()
      // Save is handled by useAutoSave, just mark clean immediately
      import('../../db/schema').then(({ updateFile }) => {
        updateFile(filePath, localContent).then(() => markDirty(filePath, false))
      })
    }

    // Shift+Tab — unindent
    if (e.key === 'Tab' && e.shiftKey) {
      // Already handled above
    }
  }, [tabSize, filePath, setContent, markDirty, localContent])

  const updateCursor = useCallback(() => {
    const ta = textareaRef.current
    if (!ta) return
    const text = ta.value.slice(0, ta.selectionStart)
    const lines = text.split('\n')
    const line = lines.length
    const col = lines[lines.length - 1].length + 1
    setActiveLine(line)
    setCursor(line, col)
    setSelection(ta.value.slice(ta.selectionStart, ta.selectionEnd))
  }, [setCursor, setSelection])

  // Focus editor on mount / filePath change
  useEffect(() => {
    if (!findReplaceOpen) {
      textareaRef.current?.focus()
    }
  }, [filePath, findReplaceOpen])

  const tabSizeCSSProp = { '--tab-size': tabSize } as React.CSSProperties

  return (
    <div className={styles.editorRoot} style={tabSizeCSSProp}>
      <div className={styles.editorBody}>
        {/* Line number gutter */}
        <div className={styles.gutter} ref={gutterRef} aria-hidden>
          {Array.from({ length: lineCount }, (_, i) => (
            <span
              key={i}
              className={`${styles.lineNum} ${i + 1 === activeLine ? styles.lineNumActive : ''}`}
              onClick={() => {
                const ta = textareaRef.current
                if (!ta) return
                const lines = localContent.split('\n')
                const pos = lines.slice(0, i).reduce((a, l) => a + l.length + 1, 0)
                ta.focus()
                ta.selectionStart = pos
                ta.selectionEnd = pos
                updateCursor()
              }}
            >
              {i + 1}
            </span>
          ))}
        </div>

        {/* Code area: textarea stacked over pre */}
        <div
          className={`${styles.codeArea} ${wordWrap ? styles.wordWrap : ''}`}
          ref={codeAreaRef}
        >
          <pre
            ref={preRef}
            className={styles.highlightedPre}
            aria-hidden
            dangerouslySetInnerHTML={{ __html: highlighted }}
            style={{
              tabSize,
              MozTabSize: tabSize,
              fontSize,
            } as React.CSSProperties}
          />
          <textarea
            ref={textareaRef}
            className={styles.textarea}
            value={localContent}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onSelect={updateCursor}
            onClick={updateCursor}
            onKeyUp={updateCursor}
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            data-gramm="false"
            aria-label={`Code editor for ${filePath}`}
            style={{
              tabSize,
              MozTabSize: tabSize,
              fontSize,
            } as React.CSSProperties}
          />
        </div>
      </div>
    </div>
  )
}
