import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, TouchableOpacity, Text, Dimensions, Modal } from 'react-native';
import { AppShell } from '../src/components/AppShell';
import { useUIStore } from '../src/stores/uiStore';
import { FileExplorer } from '../src/components/FileExplorer';
import { CodeEditor } from '../src/components/CodeEditor';
import { AIPanel } from '../src/components/AIPanel';
import { Terminal } from '../src/components/Terminal';
import { AccessoryBar } from '../src/components/AccessoryBar';
import { PreviewScreen } from '../src/components/PreviewScreen';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function App() {
  const { activeTab } = useUIStore();
  const [isAIDrawerOpen, setIsAIDrawerOpen] = useState(false);
  const [pendingInsert, setPendingInsert] = useState<string | undefined>(undefined);

  const renderContent = () => {
    switch (activeTab) {
      case 'files':
        return <FileExplorer />;
      case 'editor':
        return (
          <View style={{ flex: 1 }}>
            <CodeEditor 
              insertTrigger={pendingInsert} 
              onInserted={() => setPendingInsert(undefined)} 
            />
            <AccessoryBar onInsert={(text) => {
              setPendingInsert(text);
            }} />
          </View>
        );
      case 'terminal':
        return <Terminal />;
      case 'preview':
        return <PreviewScreen />;
      default:
        return <CodeEditor />;
    }
  };

  return (
    <AppShell>
      <View style={{ flex: 1 }}>
        {renderContent()}
        
        {/* Vibe AI Toggle Button */}
        <TouchableOpacity 
          style={styles.aiFab} 
          onPress={() => setIsAIDrawerOpen(true)}
        >
          <Text style={styles.aiFabText}>Vibe AI</Text>
        </TouchableOpacity>

        {/* AI Drawer Modal */}
        <Modal
          visible={isAIDrawerOpen}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setIsAIDrawerOpen(false)}
        >
          <View style={styles.drawerOverlay}>
            <TouchableOpacity 
              style={styles.drawerDismiss} 
              onPress={() => setIsAIDrawerOpen(false)} 
            />
            <View style={styles.drawerContent}>
              <View style={styles.drawerHeader}>
                <View style={styles.drawerHandle} />
                <Text style={styles.drawerTitle}>Vibe Assistant</Text>
                <TouchableOpacity onPress={() => setIsAIDrawerOpen(false)}>
                  <Text style={styles.closeText}>Close</Text>
                </TouchableOpacity>
              </View>
              <AIPanel />
            </View>
          </View>
        </Modal>
      </View>
      <StatusBar style="light" />
    </AppShell>
  );
}

const styles = StyleSheet.create({
  aiFab: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  aiFabText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  drawerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  drawerDismiss: {
    flex: 1,
  },
  drawerContent: {
    height: SCREEN_HEIGHT * 0.7,
    backgroundColor: '#0d0d1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  drawerHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#333',
    borderRadius: 3,
    position: 'absolute',
    top: 8,
    left: '50%',
    marginLeft: 5, // Approximate center
  },
  drawerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeText: {
    color: '#3b82f6',
    fontSize: 16,
  },
});
