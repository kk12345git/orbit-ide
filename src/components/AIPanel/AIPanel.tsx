import { useState, useRef, useEffect } from 'react'
import { useAIStore } from '../../stores/aiStore'
import { useEditorStore } from '../../stores/editorStore'
import { useUIStore } from '../../stores/uiStore'
import styles from './AIPanel.module.css'

export default function AIPanel() {
  const { messages, isLoading, error, addUserMessage, startStreaming, appendToken, finalizeStream, setError, clearHistory } = useAIStore()
  const setAIPanelOpen = useUIStore(s => s.setAIPanelOpen)
  const activeTabId = useEditorStore(s => s.activeTabId)
  const openTabs = useEditorStore(s => s.openTabs)
  const fileContents = useEditorStore(s => s.fileContents)
  const selection = useEditorStore(s => s.selection)
  const isOnline = useUIStore(s => s.isOnline)
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const activeTab = openTabs.find(t => t.id === activeTabId)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length, isLoading])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || isLoading || !isOnline) return
    setInput('')
    setError(null)

    const filePath = activeTab?.filePath
    const fileContent = filePath ? (fileContents[filePath] ?? '') : ''
    const selectionText = selection.length > 0 ? selection : null

    // Build context
    const contextLines: string[] = []
    if (activeTab) contextLines.push(`File: ${activeTab.name} (${activeTab.language})`)
    if (selectionText) contextLines.push(`Selected code:\n\`\`\`\n${selectionText}\n\`\`\``)
    else if (fileContent) {
      const truncated = fileContent.slice(0, 4000 * 4) // ~4000 tokens
      contextLines.push(`Current file:\n\`\`\`${activeTab?.language ?? ''}\n${truncated}\n\`\`\``)
    }

    const fullMessage = contextLines.length > 0
      ? `${contextLines.join('\n\n')}\n\n---\n${text}`
      : text

    addUserMessage(text, filePath)
    const msgId = `msg-${Date.now()}`
    startStreaming(msgId)

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: fullMessage }),
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      if (!reader) throw new Error('No response body')

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        for (const line of chunk.split('\n')) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') break
            try {
              const json = JSON.parse(data)
              const token = json.choices?.[0]?.delta?.content ?? json.token ?? ''
              if (token) appendToken(token)
            } catch {
              // non-JSON line, ignore
            }
          }
        }
      }
    } catch (err) {
      // Graceful degradation — show the error in chat
      const msg = err instanceof Error ? err.message : 'Unknown error'
      setError(msg)

      // Fallback demo response for offline/development
      const demoResponse = isOnline
        ? `❌ Connection error: ${msg}\n\nMake sure the ORBIT backend is running on \`/api/ai/chat\`.`
        : '📡 You are offline. AI is unavailable without an internet connection.'
      appendToken(demoResponse)
    } finally {
      finalizeStream()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleExplain = () => {
    if (!selection) return
    setInput(`Explain this code:\n\`\`\`\n${selection}\n\`\`\``)
    inputRef.current?.focus()
  }

  return (
    <div className={styles.panel}>
      {/* Header */}
      <div className={styles.header}>
        <span className={styles.title}>🤖 AI Assistant</span>
        <div className={styles.actions}>
          {selection && (
            <button className={styles.actionBtn} onClick={handleExplain} title="Explain selected code">
              Explain
            </button>
          )}
          <button className={styles.actionBtn} onClick={clearHistory} title="Clear conversation">
            Clear
          </button>
          <button className={styles.closeBtn} onClick={() => setAIPanelOpen(false)} title="Close AI panel">
            ✕
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className={styles.messages}>
        {messages.length === 0 && (
          <div className={styles.empty}>
            <p>Ask me anything about your code! 🛸</p>
            <p>I can explain code, fix bugs, refactor, and more.</p>
          </div>
        )}
        {messages.map(msg => (
          <div key={msg.id} className={`${styles.message} ${styles[msg.role]}`}>
            <div className={styles.bubble}>
              <pre className={styles.content}>{msg.content}</pre>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className={`${styles.message} ${styles.assistant}`}>
            <div className={styles.bubble}>
              <div className={styles.typing}>
                <span /><span /><span />
              </div>
            </div>
          </div>
        )}
        {error && !isLoading && (
          <div className={styles.error}>⚠️ {error}</div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className={styles.inputArea}>
        {!isOnline && (
          <div className={styles.offlineNotice}>📡 Offline — AI unavailable</div>
        )}
        <div className={styles.inputRow}>
          <textarea
            ref={inputRef}
            className={styles.input}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask AI… (Enter to send, Shift+Enter for newline)"
            rows={3}
            disabled={!isOnline || isLoading}
          />
          <button
            className={styles.sendBtn}
            onClick={handleSend}
            disabled={!isOnline || isLoading || !input.trim()}
            title="Send message"
          >↑</button>
        </div>
      </div>
    </div>
  )
}
