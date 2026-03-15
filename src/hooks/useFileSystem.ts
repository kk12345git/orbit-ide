import { useCallback } from 'react'
import { useFileSystemStore } from '../stores/fileSystemStore'
import { useEditorStore } from '../stores/editorStore'
import * as db from '../db/schema'

export function useFileSystem() {
  const { 
    files, 
    activeProjectId, 
    setFiles, 
    removeFile, 
    updateFileInStore 
  } = useFileSystemStore()
  
  const openTab = useEditorStore(s => s.openTab)
  const closeTab = useEditorStore(s => s.closeTab)
  const openTabs = useEditorStore(s => s.openTabs)

  const refreshFiles = useCallback(async () => {
    if (!activeProjectId) return
    const loaded = await db.listFiles(activeProjectId)
    setFiles(loaded as any)
  }, [activeProjectId, setFiles])

  const createFile = useCallback(async (name: string, content = '') => {
    if (!activeProjectId) return null
    const path = await db.createFile(activeProjectId, name, content)
    await refreshFiles()
    return path
  }, [activeProjectId, refreshFiles])

  const deleteFile = useCallback(async (path: string) => {
    await db.deleteFile(path)
    removeFile(path)
    
    // Close tab if open
    const tab = openTabs.find(t => t.filePath === path)
    if (tab) closeTab(tab.id)
  }, [openTabs, closeTab, removeFile])

  const renameFile = useCallback(async (path: string, newName: string) => {
    const newPath = await db.renameFile(path, newName)
    await refreshFiles()

    // Update open tab if exists
    const tab = openTabs.find(t => t.filePath === path)
    if (tab) {
      // Re-opening the tab with new info is often easier than patching
      // but let's just close and re-open for now to ensure consistency
      // or we could add an updateTab method to editorStore.
      closeTab(tab.id)
      const content = await db.readFile(newPath) ?? ''
      openTab(newPath, newName, db.detectLanguage(newName), content)
    }
    return newPath
  }, [openTabs, closeTab, openTab, refreshFiles])

  const saveFile = useCallback(async (path: string, content: string) => {
    await db.updateFile(path, content)
    updateFileInStore(path, { content, lastModified: Date.now() })
  }, [updateFileInStore])

  const getFileContent = useCallback(async (path: string) => {
    return await db.readFile(path)
  }, [])

  return {
    files,
    activeProjectId,
    refreshFiles,
    createFile,
    deleteFile,
    renameFile,
    saveFile,
    getFileContent,
  }
}
