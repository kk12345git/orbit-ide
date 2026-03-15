import { useState, useRef, useEffect, useCallback } from 'react'
import { listFiles, createFile, deleteFile, detectLanguage, readFile } from '../../db/schema'
import { useEditorStore } from '../../stores/editorStore'
import { useUIStore } from '../../stores/uiStore'
import styles from './FileExplorer.module.css'

interface FileEntry {
  path: string
  name: string
  language: string
}

const FILE_ICONS: Record<string, string> = {
  js: '📜', jsx: '⚛️', ts: '🔷', tsx: '⚛️', py: '🐍',
  css: '🎨', scss: '🎨', html: '🌐', json: '📋',
  md: '📝', sql: '🗄️', sh: '🖥️', bash: '🖥️',
  rs: '🦀', go: '🐹', txt: '📄',
}

function getIcon(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase() ?? ''
  return FILE_ICONS[ext] ?? '📄'
}

export default function FileExplorer() {
  const openTab = useEditorStore(s => s.openTab)
  const closeTab = useEditorStore(s => s.closeTab)
  const activeTabId = useEditorStore(s => s.activeTabId)
  const openTabs = useEditorStore(s => s.openTabs)
  const setSidebarOpen = useUIStore(s => s.setSidebarOpen)

  const [projectId, setProjectId] = useState<string | null>(null)
  const [files, setFiles] = useState<FileEntry[]>([])
  const [renamingPath, setRenamingPath] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [creatingNew, setCreatingNew] = useState(false)
  const [newFileName, setNewFileName] = useState('')
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; path: string } | null>(null)
  const renameRef = useRef<HTMLInputElement>(null)
  const newFileRef = useRef<HTMLInputElement>(null)

  const activeFilePath = openTabs.find(t => t.id === activeTabId)?.filePath

  // Load project from DB
  const refresh = useCallback(async (pid: string) => {
    const loaded = await listFiles(pid)
    setFiles(loaded as FileEntry[])
  }, [])

  useEffect(() => {
    // Read from localStorage (set by App.tsx after init)
    const pid = localStorage.getItem('orbit-active-project')
    if (pid) {
      setProjectId(pid)
      refresh(pid)
    }
    const onStorage = () => {
      const p = localStorage.getItem('orbit-active-project')
      if (p) { setProjectId(p); refresh(p) }
    }
    window.addEventListener('orbit-project-loaded', onStorage)
    return () => window.removeEventListener('orbit-project-loaded', onStorage)
  }, [refresh])

  const handleOpenFile = async (file: FileEntry) => {
    const existingTab = openTabs.find(t => t.filePath === file.path)
    if (existingTab) {
      useEditorStore.getState().setActiveTab(existingTab.id)
    } else {
      const content = await readFile(file.path) ?? ''
      openTab(file.path, file.name, file.language, content)
    }
    // On mobile, close sidebar after opening file
    if (window.innerWidth < 720) setSidebarOpen(false)
  }

  const handleCreateFile = async () => {
    if (!projectId) return
    const name = newFileName.trim()
    if (!name) { setCreatingNew(false); return }
    try {
      const path = await createFile(projectId, name)
      await refresh(projectId)
      setCreatingNew(false)
      setNewFileName('')
      openTab(path, name, detectLanguage(name), '')
    } catch {
      setCreatingNew(false)
    }
  }

  const handleDelete = async (path: string) => {
    if (!projectId) return
    if (!confirm(`Delete "${path.split('/').pop()}"?`)) return
    await deleteFile(path)
    await refresh(projectId)
    const tab = openTabs.find(t => t.filePath === path)
    if (tab) closeTab(tab.id)
    setContextMenu(null)
  }

  if (!projectId) {
    return (
      <div className={styles.explorer}>
        <div className={styles.empty}>Loading explorer…</div>
      </div>
    )
  }

  return (
    <div className={styles.explorer} onClick={() => setContextMenu(null)}>
      <div className={styles.header}>
        <span className={styles.title}>EXPLORER</span>
        <button
          className={styles.newFileBtn}
          title="New File"
          onClick={() => { setCreatingNew(true); setTimeout(() => newFileRef.current?.focus(), 50) }}
        >+</button>
      </div>

      <div className={styles.fileList}>
        {files.map(file => (
          <div
            key={file.path}
            className={`${styles.fileItem} ${file.path === activeFilePath ? styles.active : ''}`}
            onClick={() => handleOpenFile(file)}
            onContextMenu={e => { e.preventDefault(); setContextMenu({ x: e.clientX, y: e.clientY, path: file.path }) }}
            title={file.name}
          >
            {renamingPath === file.path ? (
              <input
                ref={renameRef}
                className={styles.renameInput}
                value={renameValue}
                onChange={e => setRenameValue(e.target.value)}
                onBlur={() => setRenamingPath(null)}
                onKeyDown={e => {
                  if (e.key === 'Escape') setRenamingPath(null)
                }}
                onClick={e => e.stopPropagation()}
              />
            ) : (
              <>
                <span className={styles.icon}>{getIcon(file.name)}</span>
                <span className={styles.name}>{file.name}</span>
              </>
            )}
          </div>
        ))}
        {creatingNew && (
          <div className={styles.fileItem}>
            <span className={styles.icon}>📄</span>
            <input
              ref={newFileRef}
              className={styles.renameInput}
              placeholder="filename.ts"
              value={newFileName}
              onChange={e => setNewFileName(e.target.value)}
              onBlur={handleCreateFile}
              onKeyDown={e => {
                if (e.key === 'Enter') handleCreateFile()
                if (e.key === 'Escape') { setCreatingNew(false); setNewFileName('') }
              }}
            />
          </div>
        )}
        {files.length === 0 && !creatingNew && (
          <p className={styles.empty}>No files yet. Click + to create one.</p>
        )}
      </div>

      {contextMenu && (
        <div
          className={styles.contextMenu}
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={e => e.stopPropagation()}
        >
          <button onClick={() => {
            setRenamingPath(contextMenu.path)
            setRenameValue(contextMenu.path.split('/').pop() ?? '')
            setContextMenu(null)
            setTimeout(() => renameRef.current?.focus(), 50)
          }}>✏️ Rename</button>
          <button className={styles.deleteBtn} onClick={() => handleDelete(contextMenu.path)}>
            🗑️ Delete
          </button>
        </div>
      )}
    </div>
  )
}
