import { useState, useRef, useEffect } from 'react'
import { useAIStore } from '../../stores/aiStore'
import { useEditorStore } from '../../stores/editorStore'
import { useUIStore } from '../../stores/uiStore'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { highlightCode } from '../../utils/highlight'
import styles from './AIPanel.module.css'

export default function AIPanel() {
  const { messages, isLoading, error, addUserMessage, startStreaming, appendToken, finalizeStream, setError, clearHistory, loadHistory } = useAIStore()
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

  // Load history when active tab changes
  useEffect(() => {
    loadHistory(activeTab?.filePath)
  }, [activeTab?.filePath, loadHistory])

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length, isLoading, messages[messages.length - 1]?.content.length])

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

  const exportHistory = () => {
    if (messages.length === 0) return
    const text = messages.map(m => `### ${m.role === 'user' ? 'User' : 'Orbit AI'} (${new Date(m.timestamp).toLocaleString()})\n\n${m.content}\n`).join('\n---\n\n')
    const blob = new Blob([text], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `orbit-chat-${activeTab?.name || 'global'}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  const renderers: any = {
    code({ node, inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || '')
      const lang = match ? match[1] : ''
      if (!inline && lang) {
        const highlighted = highlightCode(String(children).replace(/\n$/, ''), lang)
        return (
          <div style={{ position: 'relative', marginTop: '0.5rem', marginBottom: '0.5rem', backgroundColor: 'var(--color-bg-panel)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0.5rem', fontSize: '0.75rem', backgroundColor: 'rgba(255, 255, 255, 0.1)', color: 'var(--color-text-dim)' }}>
              <span>{lang}</span>
              <button 
                onClick={() => navigator.clipboard.writeText(String(children))}
                style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer' }}
                title="Copy code"
              >
                Copy
              </button>
            </div>
            <pre className={className} style={{ margin: 0, padding: '0.5rem', overflowX: 'auto', fontSize: '0.85rem' }}>
              <code dangerouslySetInnerHTML={{ __html: highlighted }} />
            </pre>
          </div>
        )
      }
      return <code className={className} style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '2px 4px', borderRadius: '4px' }} {...props}>{children}</code>
    }
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
          <button className={styles.actionBtn} onClick={exportHistory} title="Export chat history" disabled={messages.length === 0}>
            Export
          </button>
          <button className={styles.actionBtn} onClick={() => clearHistory(activeTab?.filePath)} title="Clear conversation" disabled={messages.length === 0}>
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
              {msg.role === 'user' ? (
                <pre className={styles.content} style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{msg.content}</pre>
              ) : (
                <div className={styles.content} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', lineHeight: 1.5 }}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={renderers}>
                    {msg.content}
                  </ReactMarkdown>
                </div>
              )}
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
