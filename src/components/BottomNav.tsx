import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform } from 'react-native';
import { useUIStore } from '../stores/uiStore';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab } = useUIStore();

  const tabs: { id: 'files' | 'editor' | 'ai' | 'terminal' | 'preview', label: string, icon: string }[] = [
    { id: 'files', label: 'Files', icon: '📂' },
    { id: 'editor', label: 'Code', icon: '📝' },
    { id: 'preview', label: 'Preview', icon: '🖼️' },
    { id: 'ai', label: 'AI', icon: '✨' },
    { id: 'terminal', label: 'Term', icon: '🐚' },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={[styles.tab, activeTab === tab.id && styles.activeTab]}
          onPress={() => setActiveTab(tab.id)}
        >
          <Text style={[styles.tabIcon, activeTab === tab.id && styles.activeTabIcon]}>
            {tab.icon}
          </Text>
          <Text style={[styles.tabLabel, activeTab === tab.id && styles.activeTabLabel]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 70,
    backgroundColor: 'rgba(5, 5, 16, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    paddingBottom: Platform.OS === 'ios' ? 10 : 0,
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 8,
  },
  activeTab: {
    // Subtle highlight
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 4,
    opacity: 0.5,
  },
  activeTabIcon: {
    opacity: 1,
    textShadowColor: 'rgba(59, 130, 246, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  tabLabel: {
    color: '#888',
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  activeTabLabel: {
    color: '#3b82f6',
    fontWeight: 'bold',
  },
});
