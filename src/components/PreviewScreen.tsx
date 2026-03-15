import React from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { useEditorStore } from '../stores/editorStore';

export const PreviewScreen = () => {
  const { files, activeFileId } = useEditorStore();
  const activeFile = activeFileId ? files[activeFileId] : null;

  if (!activeFile) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>No active file to preview</Text>
      </View>
    );
  }

  // Basic HTML template for preview
  const generateHtml = () => {
    // If it's already HTML, just wrap if needed or return
    if (activeFile.name.endsWith('.html')) {
        return activeFile.content;
    }

    // For other files, we can try to wrap them or just show them
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: sans-serif; padding: 20px; background: #fff; }
            pre { background: #f4f4f4; padding: 10px; border-radius: 5px; }
          </style>
        </head>
        <body>
          <h1>Preview of ${activeFile.name}</h1>
          <pre>${activeFile.content}</pre>
        </body>
      </html>
    `;
  };

  return (
    <View style={styles.container}>
      <WebView
        originWhitelist={['*']}
        source={{ html: generateHtml() }}
        style={styles.webview}
        startInLoadingState={true}
        renderLoading={() => <ActivityIndicator size="large" color="#3b82f6" />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  webview: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0d0d1a',
  },
  text: {
    color: '#fff',
    fontSize: 16,
  },
});
