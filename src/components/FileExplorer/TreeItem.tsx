import React, { useState } from 'react'
import { TreeNode } from '../../utils/treeUtils'
import styles from './FileExplorer.module.css'
import { File, Folder, ChevronRight, ChevronDown } from 'lucide-react'

interface TreeItemProps {
  node: TreeNode
  level: number
  activePath: string | undefined
  onFileClick: (node: TreeNode) => void
  onContextMenu: (e: React.MouseEvent, path: string) => void
  renamingPath: string | null
  renameValue: string
  onRenameChange: (val: string) => void
  onRenameBlur: () => void
  onRenameKeyDown: (e: React.KeyboardEvent) => void
}

export default function TreeItem({
  node,
  level,
  activePath,
  onFileClick,
  onContextMenu,
  renamingPath,
  renameValue,
  onRenameChange,
  onRenameBlur,
  onRenameKeyDown
}: TreeItemProps) {
  const [isOpen, setIsOpen] = useState(true)
  const isFolder = node.type === 'folder'
  const isActive = node.path === activePath

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsOpen(!isOpen)
  }

  const handleFileClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onFileClick(node)
  }

  return (
    <div className={styles.treeNode}>
      <div
        className={`${styles.item} ${isActive ? styles.active : ''}`}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={isFolder ? handleToggle : handleFileClick}
        onContextMenu={e => {
          e.preventDefault()
          onContextMenu(e, node.path)
        }}
      >
        <span className={styles.arrow}>
          {isFolder ? (isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />) : null}
        </span>
        <span className={styles.icon}>
          {isFolder ? <Folder size={14} /> : <File size={14} />}
        </span>
        {renamingPath === node.path ? (
          <input
            autoFocus
            className={styles.renameInput}
            value={renameValue}
            onChange={e => onRenameChange(e.target.value)}
            onBlur={onRenameBlur}
            onKeyDown={onRenameKeyDown}
            onClick={e => e.stopPropagation()}
          />
        ) : (
          <span className={styles.name}>{node.name}</span>
        )}
      </div>

      {isFolder && isOpen && node.children && (
        <div className={styles.children}>
          {node.children.map(child => (
            <TreeItem
              key={child.path}
              node={child}
              level={level + 1}
              activePath={activePath}
              onFileClick={onFileClick}
              onContextMenu={onContextMenu}
              renamingPath={renamingPath}
              renameValue={renameValue}
              onRenameChange={onRenameChange}
              onRenameBlur={onRenameBlur}
              onRenameKeyDown={onRenameKeyDown}
            />
          ))}
        </div>
      )}
    </div>
  )
}
