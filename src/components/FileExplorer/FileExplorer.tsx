import { useState, useRef, useEffect } from 'react'
import { useFileSystem } from '../../hooks/useFileSystem'
import { useEditorStore } from '../../stores/editorStore'
import { useUIStore } from '../../stores/uiStore'
import { buildTree, TreeNode } from '../../utils/treeUtils'
import TreeItem from './TreeItem'
import styles from './FileExplorer.module.css'
import { Trash, File as LucideFile } from 'lucide-react'
import { detectLanguage } from '../../db/schema'

export default function FileExplorer() {
  const { 
    files, 
    activeProjectId, 
    createFile, 
    deleteFile, 
    renameFile, 
    getFileContent,
    refreshFiles 
  } = useFileSystem()

  const openTab = useEditorStore(s => s.openTab)
  const activeTabId = useEditorStore(s => s.activeTabId)
  const openTabs = useEditorStore(s => s.openTabs)
  const setSidebarOpen = useUIStore(s => s.setSidebarOpen)

  const [renamingPath, setRenamingPath] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [creatingNew, setCreatingNew] = useState(false)
  const [newFileName, setNewFileName] = useState('')
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; path: string } | null>(null)
  
  const newFileRef = useRef<HTMLInputElement>(null)
  const activeFilePath = openTabs.find(t => t.id === activeTabId)?.filePath

  const tree = buildTree(files as any)

  useEffect(() => {
    if (activeProjectId) {
      refreshFiles()
    }
  }, [activeProjectId, refreshFiles])

  const handleOpenFile = async (node: TreeNode) => {
    const existingTab = openTabs.find(t => t.filePath === node.path)
    if (existingTab) {
      useEditorStore.getState().setActiveTab(existingTab.id)
    } else {
      const content = await getFileContent(node.path) ?? ''
      openTab(node.path, node.name, detectLanguage(node.name), content)
    }
    if (window.innerWidth < 720) setSidebarOpen(false)
  }

  const handleCreateFile = async () => {
    const name = newFileName.trim()
    if (!name) { setCreatingNew(false); return }
    try {
      const path = await createFile(name)
      if (path) {
        openTab(path, name, detectLanguage(name), '')
      }
      setCreatingNew(false)
      setNewFileName('')
    } catch {
      setCreatingNew(false)
    }
  }

  const handleDelete = async (path: string) => {
    if (!window.confirm(`Delete "${path.split('/').pop()}"?`)) return
    await deleteFile(path)
    setContextMenu(null)
  }

  const handleRenameConfirm = async () => {
    if (!renamingPath) return
    const newName = renameValue.trim()
    if (!newName || newName === renamingPath.split('/').pop()) {
      setRenamingPath(null)
      return
    }
    try {
      await renameFile(renamingPath, newName)
      setRenamingPath(null)
    } catch (e) {
      console.error(e)
      setRenamingPath(null)
    }
  }

  if (!activeProjectId) {
    return (
      <div className={styles.explorer}>
        <div className={styles.empty}>No project active</div>
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
