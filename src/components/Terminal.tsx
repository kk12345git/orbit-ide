import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, ScrollView } from 'react-native';

export const Terminal: React.FC = () => {
  const [output, setOutput] = useState<string[]>(['Orbit Terminal v1.0.0', 'Type "help" for a list of commands.']);
  const [input, setInput] = useState('');

  const handleCommand = () => {
    const cmd = input.trim().toLowerCase();
    let response = '';

    switch (cmd) {
      case 'help':
        response = 'Available commands: help, clear, ls, echo [text]';
        break;
      case 'ls':
        response = 'App.tsx  assets/  src/  package.json';
        break;
      case 'clear':
        setOutput([]);
        setInput('');
        return;
      default:
        if (cmd.startsWith('echo ')) {
          response = cmd.substring(5);
        } else {
          response = `Command not found: ${cmd}`;
        }
    }

    setOutput((prev) => [...prev, `> ${input}`, response]);
    setInput('');
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.outputScroll} contentContainerStyle={styles.outputContent}>
        {output.map((line, i) => (
          <Text key={i} style={styles.outputText}>{line}</Text>
        ))}
      </ScrollView>
      <View style={styles.inputContainer}>
        <Text style={styles.prompt}>$ </Text>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          onSubmitEditing={handleCommand}
          placeholder="Type a command..."
          placeholderTextColor="#666"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 10,
  },
  outputScroll: {
    flex: 1,
  },
  outputContent: {
    paddingBottom: 10,
  },
  outputText: {
    color: '#0f0',
    fontFamily: 'monospace',
    fontSize: 14,
    marginBottom: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingTop: 8,
  },
  prompt: {
    color: '#0f0',
    fontFamily: 'monospace',
    fontSize: 14,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontFamily: 'monospace',
    fontSize: 14,
    height: 40,
  },
});
