import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { listFiles, createFile, deleteFile, detectLanguage, readFile, renameFile } from '../../db/schema'
import { useEditorStore } from '../../stores/editorStore'
import { useUIStore } from '../../stores/uiStore'
import { buildTree, TreeNode } from '../../utils/treeUtils'
import TreeItem from './TreeItem'
import styles from './FileExplorer.module.css'
import { Trash, FilePlus, File as LucideFile } from 'lucide-react'

interface FileEntry {
  path: string
  name: string
  language: string
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
  const newFileRef = useRef<HTMLInputElement>(null)

  const activeFilePath = openTabs.find(t => t.id === activeTabId)?.filePath

  const tree = useMemo(() => buildTree(files), [files])

  const refresh = useCallback(async (pid: string) => {
    const loaded = await listFiles(pid)
    setFiles(loaded as FileEntry[])
  }, [])

  useEffect(() => {
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

  const handleOpenFile = async (node: TreeNode) => {
    const existingTab = openTabs.find(t => t.filePath === node.path)
    if (existingTab) {
      useEditorStore.getState().setActiveTab(existingTab.id)
    } else {
      const content = await readFile(node.path) ?? ''
      openTab(node.path, node.name, detectLanguage(node.name), content)
    }
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

  const handleRenameConfirm = async () => {
    if (!projectId || !renamingPath) return
    const newName = renameValue.trim()
    if (!newName || newName === renamingPath.split('/').pop()) {
      setRenamingPath(null)
      return
    }
    try {
      const newPath = await renameFile(renamingPath, newName)
      await refresh(projectId)
      
      const tab = openTabs.find(t => t.filePath === renamingPath)
      if (tab) {
        closeTab(tab.id)
        const content = await readFile(newPath) ?? ''
        openTab(newPath, newName, detectLanguage(newName), content)
      }
      setRenamingPath(null)
    } catch (e) {
      console.error(e)
      setRenamingPath(null)
    }
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
        {tree.map(node => (
          <TreeItem
            key={node.path}
            node={node}
            level={0}
            activePath={activeFilePath}
            onFileClick={handleOpenFile}
            onContextMenu={(e, path) => {
              e.preventDefault()
              setContextMenu({ x: e.clientX, y: e.clientY, path })
            }}
            renamingPath={renamingPath}
            renameValue={renameValue}
            onRenameChange={setRenameValue}
            onRenameBlur={handleRenameConfirm}
            onRenameKeyDown={e => {
              if (e.key === 'Enter') handleRenameConfirm()
              if (e.key === 'Escape') setRenamingPath(null)
            }}
          />
        ))}

        {creatingNew && (
          <div className={styles.item} style={{ paddingLeft: '20px' }}>
            <span className={styles.icon}><LucideFile size={14} /></span>
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
          }}>Rename</button>
          <button className={styles.deleteBtn} onClick={() => handleDelete(contextMenu.path)}>
            <Trash size={14} /> Delete
          </button>
        </div>
      )}
    </div>
  )
}
