import { create } from 'zustand'

export interface AIMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  filePath?: string
}

interface AIState {
  messages: AIMessage[]
  isLoading: boolean
  streamingContent: string
  error: string | null
  queriesUsed: number   // Free tier: count in localStorage

  // Actions
  addUserMessage:   (content: string, filePath?: string) => string
  startStreaming:   (messageId: string) => void
  appendToken:      (token: string) => void
  finalizeStream:   () => void
  setError:         (error: string | null) => void
  clearHistory:     () => void
  incrementQueries: () => void
}

export const useAIStore = create<AIState>((set, get) => ({
  messages: [],
  isLoading: false,
  streamingContent: '',
  error: null,
  queriesUsed: parseInt(localStorage.getItem('orbit-ai-queries') ?? '0', 10),

  addUserMessage: (content, filePath) => {
    const id = `msg-${Date.now()}`
    const msg: AIMessage = { id, role: 'user', content, timestamp: Date.now(), filePath }
    set(s => ({ messages: [...s.messages, msg] }))
    return id
  },

  startStreaming: (_messageId) => {
    const id = `msg-${Date.now()}-ai`
    const assistantMsg: AIMessage = { id, role: 'assistant', content: '', timestamp: Date.now() }
    set(s => ({
      isLoading: true,
      streamingContent: '',
      messages: [...s.messages, assistantMsg]
    }))
  },

  appendToken: (token) =>
    set(s => {
      const msgs = [...s.messages]
      const last = msgs[msgs.length - 1]
      if (last && last.role === 'assistant') {
        msgs[msgs.length - 1] = { ...last, content: last.content + token }
      }
      return { messages: msgs, streamingContent: s.streamingContent + token }
    }),

  finalizeStream: () => set({ isLoading: false, streamingContent: '' }),

  setError: (error) => set({ error, isLoading: false }),

  clearHistory: () => set({ messages: [], streamingContent: '', error: null }),

  incrementQueries: () => {
    const next = get().queriesUsed + 1
    localStorage.setItem('orbit-ai-queries', String(next))
    set({ queriesUsed: next })
  },
}))
