import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TextInput, TouchableOpacity, ScrollView, FlatList, ActivityIndicator } from 'react-native';
import { useTranscription } from '../../hooks/use-transcription';
import { useTodoExtractor, TodoItem } from '../../hooks/use-todo-extractor';

export default function TranscriptionScreen() {
  const { isRecording, startRecording, stopAndTranscribe } = useTranscription();
  const { todos, isProcessing, extractTodos, setTodos } = useTodoExtractor();

  // モード切り替え状態 (false: 手動, true: 自動)
  const [isAutoMode, setIsAutoMode] = useState(false);
  // 文字起こしされた生のテキスト
  const [rawText, setRawText] = useState('');
  // 変換中かどうかのローディング
  const [isTranscribing, setIsTranscribing] = useState(false);

  // 録音停止時の処理
  const handleStop = async () => {
    setIsTranscribing(true);
    const text = await stopAndTranscribe();
    setIsTranscribing(false);

    if (text) {
      setRawText(text);
      // 自動モードなら、そのままGPTへ
      if (isAutoMode) {
        await extractTodos(text);
      }
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>AI Transcription & TODO</Text>

      {/* モード切り替えトグル */}
      <View style={styles.modeSwitchContainer}>
        <Text style={styles.modeLabel}>{isAutoMode ? "自動モード (即時抽出)" : "手動モード (確認・修正)"}</Text>
        <Switch
          value={isAutoMode}
          onValueChange={(value) => setIsAutoMode(value)}
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={isAutoMode ? "#f5dd4b" : "#f4f3f4"}
        />
      </View>

      {/* 録音ボタン */}
      <TouchableOpacity 
        style={[styles.recordButton, isRecording ? styles.stopButton : styles.startButton]} 
        onPress={isRecording ? handleStop : startRecording}
        disabled={isTranscribing || isProcessing}
      >
        <Text style={styles.buttonText}>
          {isRecording ? "録音を停止" : "録音を開始"}
        </Text>
      </TouchableOpacity>

      {/* テキスト確認・修正エリア（手動モード時、または自動モード後のバックアップとして） */}
      <View style={styles.section}>
        <Text style={styles.subtitle}>1. 文字起こし結果 (修正可能)</Text>
        {isTranscribing ? (
          <ActivityIndicator color="#007AFF" />
        ) : (
          <TextInput
            style={styles.textInput}
            multiline
            value={rawText}
            onChangeText={setRawText}
            placeholder="ここに文字起こし結果が表示されます..."
          />
        )}
        
        {!isAutoMode && rawText.length > 0 && (
          <TouchableOpacity 
            style={styles.convertButton} 
            onPress={() => extractTodos(rawText)}
            disabled={isProcessing}
          >
            <Text style={styles.buttonText}>TODOに変換</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 抽出されたTODOリスト */}
      <View style={styles.section}>
        <Text style={styles.subtitle}>2. 抽出されたタスク</Text>
        {isProcessing ? (
          <ActivityIndicator size="large" color="#007AFF" />
        ) : (
          todos.map((item, index) => (
            <View key={index} style={styles.todoCard}>
              <Text style={styles.todoTask}>{item.task}</Text>
              {item.deadline && <Text style={styles.todoDate}>📅 {item.deadline}</Text>}
              {item.description && <Text style={styles.todoDate}>📝 {item.description}</Text>}
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  modeSwitchContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16
  },
  modeLabel: { fontSize: 14, color: '#333' },
  recordButton: { padding: 16, borderRadius: 30, alignItems: 'center', marginBottom: 20 },
  startButton: { backgroundColor: '#007AFF' },
  stopButton: { backgroundColor: '#FF3B30' },
  section: { backgroundColor: '#fff', padding: 16, borderRadius: 10, marginBottom: 16 },
  subtitle: { fontSize: 14, fontWeight: 'bold', color: '#666', marginBottom: 10 },
  textInput: { 
    minHeight: 100, 
    borderColor: '#eee', 
    borderWidth: 1, 
    borderRadius: 8, 
    padding: 10, 
    textAlignVertical: 'top' 
  },
  convertButton: { backgroundColor: '#34C759', padding: 12, borderRadius: 8, marginTop: 10, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  todoCard: { 
    padding: 12, 
    borderBottomWidth: 1, 
    borderBottomColor: '#eee' 
  },
  todoTask: { fontSize: 16, color: '#333' },
  todoDate: { fontSize: 12, color: '#888', marginTop: 4 }
});