import { useState, useRef, useEffect, useCallback } from 'react'
import { useUIStore } from '../../stores/uiStore'
import styles from './Terminal.module.css'

interface OutputLine {
  type: 'input' | 'output' | 'error'
  text: string
}

// Simple in-memory virtual file system for the terminal
const VFS: Record<string, string> = {
  '/': '__dir__',
  '/home': '__dir__',
  '/home/user': '__dir__',
}

const HOSTNAME = 'orbit'
const USERNAME = 'user'
let cwd = '/home/user'

function resolvePath(path: string): string {
  if (path.startsWith('/')) return path
  if (path === '~') return '/home/user'
  if (path.startsWith('~/')) return '/home/user' + path.slice(1)
  if (path === '..') {
    const parts = cwd.split('/').filter(Boolean)
    parts.pop()
    return '/' + parts.join('/')
  }
  return cwd.endsWith('/') ? cwd + path : cwd + '/' + path
}

function processCommand(raw: string): string[] {
  const [cmd, ...args] = raw.trim().split(/\s+/)
  const out: string[] = []

  switch (cmd) {
    case '': break
    case 'clear': return ['__CLEAR__']
    case 'echo': out.push(args.join(' ')); break
    case 'pwd': out.push(cwd); break
    case 'date': out.push(new Date().toString()); break
    case 'whoami': out.push(USERNAME); break
    case 'hostname': out.push(HOSTNAME); break

    case 'ls': {
      const target = args[0] ? resolvePath(args[0]) : cwd
      const prefix = target.endsWith('/') ? target : target + '/'
      const entries = Object.keys(VFS)
        .filter(k => k !== prefix.slice(0, -1) && k.startsWith(prefix))
        .map(k => {
          const rest = k.slice(prefix.length)
          if (!rest.includes('/')) return VFS[k] === '__dir__' ? rest + '/' : rest
          return null
        })
        .filter(Boolean) as string[]
      if (entries.length === 0) out.push('(empty)')
      else out.push(entries.join('  '))
      break
    }

    case 'cd': {
      const target = args[0] ? resolvePath(args[0]) : '/home/user'
      if (VFS[target] === '__dir__') { cwd = target; }
      else { out.push(`cd: no such directory: ${args[0]}`) }
      break
    }

    case 'mkdir': {
      if (!args[0]) { out.push('mkdir: missing operand'); break }
      const p = resolvePath(args[0])
      VFS[p] = '__dir__'
      break
    }

    case 'touch': {
      if (!args[0]) { out.push('touch: missing operand'); break }
      const p = resolvePath(args[0])
      if (!VFS[p]) VFS[p] = ''
      break
    }

    case 'cat': {
      if (!args[0]) { out.push('cat: missing file operand'); break }
      const p = resolvePath(args[0])
      if (!VFS[p]) { out.push(`cat: ${args[0]}: No such file`) }
      else if (VFS[p] === '__dir__') { out.push(`cat: ${args[0]}: Is a directory`) }
      else if (VFS[p] === '') { /* empty file */ }
      else { out.push(VFS[p]) }
      break
    }

    case 'rm': {
      if (!args[0]) { out.push('rm: missing operand'); break }
      const p = resolvePath(args[0])
      if (!VFS[p]) { out.push(`rm: cannot remove '${args[0]}': No such file`) }
      else { delete VFS[p] }
      break
    }

    case 'help':
      out.push('Available commands: ls, cd, pwd, mkdir, touch, cat, rm, echo, clear, date, whoami, hostname, help')
      break

    default:
      out.push(`${cmd}: command not found. Type 'help' for available commands.`)
  }

  return out
}

export default function Terminal() {
  const [lines, setLines] = useState<OutputLine[]>([
    { type: 'output', text: `ORBIT IDE Terminal — Type 'help' for commands` },
  ])
  const [inputVal, setInputVal] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [historyIdx, setHistoryIdx] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const toggleTerminal = useUIStore(s => s.toggleTerminal)

  const prompt = `${USERNAME}@${HOSTNAME}:${cwd}$ `

  useEffect(() => {
    bottomRef.current?.scrollIntoView()
  }, [lines])

  const runCommand = useCallback((raw: string) => {
    const outputTokens = processCommand(raw)
    if (outputTokens[0] === '__CLEAR__') {
      setLines([])
      return
    }
    const newLines: OutputLine[] = [
      { type: 'input', text: prompt + raw },
      ...outputTokens.map(t => ({ type: 'output' as const, text: t })),
    ]
    setLines(l => [...l, ...newLines])
    if (raw.trim()) setHistory(h => [raw, ...h].slice(0, 100))
    setHistoryIdx(-1)
  }, [prompt])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      runCommand(inputVal)
      setInputVal('')
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const idx = Math.min(historyIdx + 1, history.length - 1)
      setHistoryIdx(idx)
      setInputVal(history[idx] ?? '')
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      const idx = Math.max(historyIdx - 1, -1)
      setHistoryIdx(idx)
      setInputVal(idx === -1 ? '' : history[idx] ?? '')
    }
  }

  return (
    <div className={styles.terminal} onClick={() => inputRef.current?.focus()}>
      <div className={styles.header}>
        <span className={styles.title}>Terminal</span>
        <button className={styles.closeBtn} onClick={toggleTerminal}>✕</button>
      </div>
      <div className={styles.output}>
        {lines.map((l, i) => (
          <div key={i} className={`${styles.line} ${styles[l.type]}`}>
            {l.text}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className={styles.inputRow}>
        <span className={styles.prompt}>{prompt}</span>
        <input
          ref={inputRef}
          className={styles.input}
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          autoComplete="off"
          autoFocus
        />
      </div>
    </div>
  )
}
