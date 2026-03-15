import React from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useEditorStore } from '../stores/editorStore';
import { useUIStore } from '../stores/uiStore';

interface FileItem {
  id: string;
  name: string;
  language: string;
}

export const FileExplorer: React.FC = () => {
  const { files, openFile, addFile, deleteFile } = useEditorStore();
  const { setActiveTab } = useUIStore();

  const fileList = Object.values(files) as FileItem[];

  const handleFilePress = (id: string) => {
    openFile(id);
    setActiveTab('editor');
  };

  const handleCreateFile = () => {
    const name = `file_${Math.floor(Math.random() * 1000)}.tsx`;
    addFile(name, '// New file\n', 'typescript');
  };

  const renderItem = ({ item }: { item: FileItem }) => (
    <View style={styles.fileItemContainer}>
      <TouchableOpacity 
        style={styles.fileItem} 
        onPress={() => handleFilePress(item.id)}
      >
        <Text style={styles.fileIcon}>📄</Text>
        <Text style={styles.fileName}>{item.name}</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.deleteButton} 
        onPress={() => deleteFile(item.id)}
      >
        <Text style={styles.deleteText}>✕</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>PROJECT</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleCreateFile}>
          <Text style={styles.addButtonText}>+ New File</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={fileList}
        renderItem={renderItem}
        keyExtractor={(item: FileItem) => item.id}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0d1a',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    color: '#aaa',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  addButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  listContent: {
    paddingBottom: 20,
  },
  fileItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    backgroundColor: '#16162e',
    borderRadius: 8,
    paddingRight: 12,
  },
  fileItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  fileIcon: {
    marginRight: 10,
    fontSize: 16,
  },
  fileName: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
  },
  deleteButton: {
    padding: 8,
  },
  deleteText: {
    color: '#ef4444',
    fontSize: 16,
  },
});
