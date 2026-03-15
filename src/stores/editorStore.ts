import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fileSystemService } from '../services/fileSystemService';

interface EditorFile {
  id: string;
  name: string;
  content: string;
  language: string;
}

interface EditorState {
  files: Record<string, EditorFile>;
  activeFileId: string | null;
  setFiles: (files: Record<string, EditorFile>) => void;
  openFile: (id: string) => void;
  closeFile: (id: string) => void;
  updateFileContent: (id: string, content: string) => void;
  addFile: (name: string, content: string, language: string) => Promise<void>;
}

export const useEditorStore = create<EditorState>()(
  persist(
    (set: (state: Partial<EditorState> | ((state: EditorState) => Partial<EditorState>), replace?: boolean) => void) => ({
      files: {
        '1': { id: '1', name: 'App.tsx', content: '// Welcome to ORBIT IDE\n\nexport default function App() {\n  return <div>Hello World</div>;\n}', language: 'typescript' },
        '2': { id: '2', name: 'styles.css', content: 'body {\n  background: #000;\n  color: #fff;\n}', language: 'css' },
      },
      activeFileId: '1',
      setFiles: (files: Record<string, EditorFile>) => set({ files }),
      openFile: (id: string) => set({ activeFileId: id }),
      closeFile: (id: string) => set((state: EditorState) => {
        const newFiles = { ...state.files };
        delete newFiles[id];
        return { 
          files: newFiles, 
          activeFileId: state.activeFileId === id ? null : state.activeFileId 
        };
      }),
      addFile: async (name: string, content: string, language: string) => {
        const id = Math.random().toString(36).substr(2, 9);
        await fileSystemService.saveFile(name, content);
        set((state: EditorState) => ({
          files: { ...state.files, [id]: { id, name, content, language } },
          activeFileId: id,
        }));
      },
      updateFileContent: (id: string, content: string) => set((state: EditorState) => {
        const file = state.files[id];
        if (file) {
          fileSystemService.saveFile(file.name, content);
          return {
            files: {
              ...state.files,
              [id]: { ...file, content }
            }
          };
        }
        return state;
      }),
      deleteFile: (id: string) => set((state: EditorState) => {
        const newFiles = { ...state.files };
        delete newFiles[id];
        return { 
          files: newFiles, 
          activeFileId: state.activeFileId === id ? null : state.activeFileId 
        };
      }),
    }),
    {
      name: 'orbit-editor-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
