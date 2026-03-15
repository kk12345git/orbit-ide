import React from 'react';
import { StyleSheet, View, TextInput, ScrollView, Text } from 'react-native';
import { useEditorStore } from '../stores/editorStore';
import SyntaxHighlighter from 'react-native-syntax-highlighter';
import { shadesOfPurple } from 'react-syntax-highlighter/dist/esm/styles/hljs';

interface CodeEditorProps {
  insertTrigger?: string;
  onInserted?: () => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ insertTrigger, onInserted }) => {
  const { activeFileId, files, updateFileContent } = useEditorStore();
  const activeFile = activeFileId ? files[activeFileId] : null;
  const [selection, setSelection] = React.useState({ start: 0, end: 0 });

  React.useEffect(() => {
    if (insertTrigger && activeFile) {
      const { start, end } = selection;
      const newContent = 
        activeFile.content.substring(0, start) + 
        insertTrigger + 
        activeFile.content.substring(end);
      
      updateFileContent(activeFile.id, newContent);
      onInserted?.();
    }
  }, [insertTrigger]);

  if (!activeFile) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Select a file to start editing</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <SyntaxHighlighter
          language="typescript"
          style={shadesOfPurple}
          customStyle={{ padding: 15, backgroundColor: 'transparent' }}
          fontSize={14}
        >
          {activeFile.content || ''}
        </SyntaxHighlighter>
        <TextInput
          multiline
          autoCapitalize="none"
          autoCorrect={false}
          spellCheck={false}
          value={activeFile.content}
          onChangeText={(text) => updateFileContent(activeFile.id, text)}
          onSelectionChange={(e) => setSelection(e.nativeEvent.selection)}
          style={styles.input}
          placeholderTextColor="#444"
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0d1a',
  },
  scrollContent: {
    flexGrow: 1,
  },
  input: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    color: 'transparent',
    padding: 15,
    fontSize: 14,
    fontFamily: 'monospace',
    textAlignVertical: 'top',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#555',
    fontSize: 16,
  },
});
