import * as FileSystem from 'expo-file-system';

const BASE_DIR = FileSystem.documentDirectory + 'orbit_projects/';

export const fileSystemService = {
  ensureBaseDir: async () => {
    const info = await FileSystem.getInfoAsync(BASE_DIR);
    if (!info.exists) {
      await FileSystem.makeDirectoryAsync(BASE_DIR, { intermediates: true });
    }
  },

  saveFile: async (name: string, content: string) => {
    await fileSystemService.ensureBaseDir();
    const fileUri = BASE_DIR + name;
    await FileSystem.writeAsStringAsync(fileUri, content, { encoding: FileSystem.EncodingType.UTF8 });
    return fileUri;
  },

  readFile: async (name: string) => {
    const fileUri = BASE_DIR + name;
    const info = await FileSystem.getInfoAsync(fileUri);
    if (info.exists) {
      return await FileSystem.readAsStringAsync(fileUri, { encoding: FileSystem.EncodingType.UTF8 });
    }
    return null;
  },

  listFiles: async () => {
    await fileSystemService.ensureBaseDir();
    return await FileSystem.readDirectoryAsync(BASE_DIR);
  },

  deleteFile: async (name: string) => {
    const fileUri = BASE_DIR + name;
    await FileSystem.deleteAsync(fileUri, { idempotent: true });
  }
};
