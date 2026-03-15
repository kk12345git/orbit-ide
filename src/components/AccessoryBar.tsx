import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ScrollView } from 'react-native';

const SYMBOLS = ['{', '}', '[', ']', '(', ')', ';', '"', "'", '<', '>', '/', '=', '!', '&', '|', '?', ':'];

interface AccessoryBarProps {
  onInsert: (text: string) => void;
}

export const AccessoryBar: React.FC<{ onInsert: (text: string) => void }> = ({ onInsert }) => {
  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity style={styles.tabButton} onPress={() => onInsert('  ')}>
          <Text style={styles.tabText}>TAB</Text>
        </TouchableOpacity>
        {SYMBOLS.map((symbol) => (
          <TouchableOpacity 
            key={symbol} 
            style={styles.symbolButton} 
            onPress={() => onInsert(symbol)}
          >
            <Text style={styles.symbolText}>{symbol}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 44,
    backgroundColor: '#111',
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  scrollContent: {
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  tabButton: {
    paddingHorizontal: 15,
    paddingVertical: 6,
    backgroundColor: '#333',
    borderRadius: 6,
    marginRight: 10,
  },
  tabText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  symbolButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#222',
    borderRadius: 6,
    marginRight: 6,
  },
  symbolText: {
    color: '#fff',
    fontSize: 18,
  },
});
