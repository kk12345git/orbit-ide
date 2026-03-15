import React, { useState, useRef } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';

import { aiService, Message } from '../services/aiService';
import { useEditorStore } from '../stores/editorStore';

export const AIPanel: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I am your ORBIT AI. How can I help you code today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { files, activeFileId, updateFileContent } = useEditorStore();
  const scrollViewRef = useRef<ScrollView>(null);

  const activeFile = activeFileId ? files[activeFileId] : null;

  const extractCode = (text: string) => {
    const match = text.match(/```(?:typescript|javascript|tsx|jsx|css|html|json)?\n([\s\S]*?)```/);
    return match ? match[1] : null;
  };

  const applyChanges = (code: string) => {
    if (activeFileId && code) {
      updateFileContent(activeFileId, code);
      const ackMsg: Message = { role: 'assistant', content: 'Changes applied to ' + (activeFile?.name || 'file') + '!' };
      setMessages((prev: Message[]) => [...prev, ackMsg]);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    const newUserMessage: Message = { role: 'user', content: input };
    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await aiService.chat(updatedMessages, activeFile?.content);
      setMessages((prev: Message[]) => [
        ...prev,
        { role: 'assistant', content: response }
      ]);
    } catch (error) {
      setMessages((prev: Message[]) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <ScrollView 
        style={styles.messageList} 
        contentContainerStyle={styles.scrollContent}
        ref={scrollViewRef}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((m: Message, i: number) => {
          const code = m.role === 'assistant' ? extractCode(m.content) : null;
          return (
            <View key={i} style={[styles.messageBubble, m.role === 'user' ? styles.userBubble : styles.assistantBubble]}>
              <Text style={styles.roleHeader}>{m.role === 'user' ? 'YOU' : 'ORBIT AI'}</Text>
              <Text style={styles.messageText}>{m.content}</Text>
              {code && (
                <TouchableOpacity 
                  style={styles.applyButton} 
                  onPress={() => applyChanges(code)}
                >
                  <Text style={styles.applyButtonText}>🚀 Apply Code to Editor</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}
        {isLoading && (
          <View style={[styles.messageBubble, styles.assistantBubble]}>
            <Text style={styles.typingText}>Orbit AI is thinking...</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.inputArea}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Ask anything or request code changes..."
            placeholderTextColor="#666"
            multiline
          />
          <TouchableOpacity 
            style={[styles.sendButton, !input.trim() && styles.sendButtonDisabled]} 
            onPress={sendMessage}
            disabled={!input.trim() || isLoading}
          >
            <Text style={styles.sendIcon}>➔</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.footerNote}>AI may generate incorrect code. Always verify.</Text>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050510',
  },
  messageList: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  messageBubble: {
    padding: 14,
    borderRadius: 16,
    marginBottom: 16,
    maxWidth: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#3b82f6',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(30, 30, 60, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderBottomLeftRadius: 4,
  },
  roleHeader: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 4,
    letterSpacing: 1,
  },
  messageText: {
    color: '#fff',
    fontSize: 15,
    lineHeight: 22,
  },
  applyButton: {
    marginTop: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#10b981',
  },
  applyButtonText: {
    color: '#10b981',
    fontSize: 13,
    fontWeight: 'bold',
  },
  typingText: {
    color: '#aaa',
    fontSize: 14,
    fontStyle: 'italic',
  },
  inputArea: {
    padding: 16,
    paddingTop: 10,
    backgroundColor: 'rgba(10, 10, 25, 0.9)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 24,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 15,
    maxHeight: 120,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  sendButtonDisabled: {
    backgroundColor: '#222',
  },
  sendIcon: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footerNote: {
    textAlign: 'center',
    color: '#444',
    fontSize: 10,
    marginTop: 8,
  },
});
