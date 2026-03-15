import { create } from 'zustand'

interface FileEntry {
  path: string
  name: string
  content: string
  language: string
  lastModified: number
  projectId: string
}

interface FileSystemState {
  files: FileEntry[]
  activeProjectId: string | null
  setFiles: (files: FileEntry[]) => void
  setActiveProjectId: (id: string | null) => void
  addFile: (file: FileEntry) => void
  removeFile: (path: string) => void
  updateFileInStore: (path: string, updates: Partial<FileEntry>) => void
}

export const useFileSystemStore = create<FileSystemState>((set) => ({
  files: [],
  activeProjectId: localStorage.getItem('orbit-active-project'),
  setFiles: (files) => set({ files }),
  setActiveProjectId: (id) => {
    if (id) localStorage.setItem('orbit-active-project', id)
    else localStorage.removeItem('orbit-active-project')
    set({ activeProjectId: id })
  },
  addFile: (file) => set((state) => ({ files: [...state.files, file] })),
  removeFile: (path) =>
    set((state) => ({ files: state.files.filter((f) => f.path !== path) })),
  updateFileInStore: (path, updates) =>
    set((state) => ({
      files: state.files.map((f) => (f.path === path ? { ...f, ...updates } : f)),
    })),
}))
