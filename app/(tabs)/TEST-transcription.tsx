import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useTranscription } from '../../hooks/use-transcription';
import { useTodoExtractor, TodoItem } from '../../hooks/use-todo-extractor';
import { useItemsManager } from '../../hooks/use-items-manager'; // 追加
import { NewItem } from '../../db/db-service';

export default function TranscriptionScreen() {
  const { isRecording, startRecording, stopAndTranscribe } = useTranscription();
  const { todos, isProcessing, extractTodos, setTodos } = useTodoExtractor();
  const { addItem } = useItemsManager(); // DB操作用

  const [isAutoMode, setIsAutoMode] = useState(false);
  const [rawText, setRawText] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);

  // AIの日付文字列をタイムスタンプに変換するヘルパー
  const parseDeadline = (deadline?: string | null): number | null => {
    if (!deadline) return null;
    const date = new Date(deadline);
    return isNaN(date.getTime()) ? null : date.getTime();
  };

  // 単一タスクをDBに登録してリストから消す
  const handleSaveSingle = async (item: TodoItem, index: number) => {
    const newItem: NewItem = {
      title: item.task,
      description: item.description || '',
      is_done: false,
      datetime_at: parseDeadline(item.deadline),
    };
    await addItem(newItem);
    // 保存したものをリストから除外
    setTodos(prev => prev.filter((_, i) => i !== index));
  };

  // 全タスクを一括登録
  const handleSaveAll = async () => {
    if (todos.length === 0) return;

    for (const item of todos) {
      const newItem: NewItem = {
        title: item.task,
        description: item.description || '',
        is_done: false,
        datetime_at: parseDeadline(item.deadline),
      };
      await addItem(newItem);
    }
    setTodos([]); // リストを空にする
    Alert.alert("完了", "すべてのタスクを登録しました");
  };

  // リストから削除（取り消し）
  const handleRemove = (index: number) => {
    setTodos(prev => prev.filter((_, i) => i !== index));
  };

  const handleStop = async () => {
    setIsTranscribing(true);
    const text = await stopAndTranscribe();
    setIsTranscribing(false);

    if (text) {
      setRawText(text);
      if (isAutoMode) {
        await extractTodos(text);
      }
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>AI TODO 抽出</Text>

      {/* モード切り替え & 録音ボタン (中略: 既存のまま) */}
      <View style={styles.modeSwitchContainer}>
        <Text style={styles.modeLabel}>{isAutoMode ? "自動モード (即時抽出)" : "手動モード (確認・修正)"}</Text>
        <Switch value={isAutoMode} onValueChange={setIsAutoMode} />
      </View>

      <TouchableOpacity
        style={[styles.recordButton, isRecording ? styles.stopButton : styles.startButton]}
        onPress={isRecording ? handleStop : startRecording}
        disabled={isTranscribing || isProcessing}
      >
        <Text style={styles.buttonText}>{isRecording ? "録音を停止" : "録音を開始"}</Text>
      </TouchableOpacity>

      {/* 文字起こし結果エリア */}
      <View style={styles.section}>
        {isTranscribing ? (
          <ActivityIndicator size="large" color="#007AFF" />
        ) : (
          <>
            <TextInput
              style={styles.textInput}
              multiline
              value={rawText}
              onChangeText={setRawText}
              placeholder="文字起こし結果..."
            />
            {/* 手動モードかつテキストがある場合のみボタンを表示 */}
            {!isAutoMode && rawText.length > 0 && (
              <TouchableOpacity
                style={styles.convertButton}
                onPress={() => extractTodos(rawText)}
              >
                <Text style={styles.buttonText}>AIでTODOを抽出</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>


      {/* 抽出されたTODOリスト */}
      <View style={styles.section}>
        <View style={styles.rowBetween}>
          <Text style={styles.subtitle}>2. 抽出されたタスク ({todos.length})</Text>
          {todos.length > 0 && (
            <TouchableOpacity onPress={handleSaveAll}>
              <Text style={styles.addAllText}>すべて追加</Text>
            </TouchableOpacity>
          )}
        </View>

        {isProcessing ? (
          <ActivityIndicator size="large" color="#007AFF" />
        ) : (
          todos.map((item, index) => (
            <View key={index} style={styles.todoCard}>
              <View style={styles.todoInfo}>
                <Text style={styles.todoTask}>{item.task}</Text>
                {item.deadline && <Text style={styles.todoDate}>📅 {item.deadline}</Text>}
                {item.description && <Text style={styles.todoDescription}>{item.description}</Text>}
              </View>
              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.addButton} onPress={() => handleSaveSingle(item, index)}>
                  <Text style={styles.actionText}>追加</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.removeButton} onPress={() => handleRemove(index)}>
                  <Text style={styles.actionText}>消去</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16, paddingTop: 45 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  modeSwitchContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 12, borderRadius: 10, marginBottom: 16 },
  modeLabel: { fontSize: 14, color: '#333' },
  recordButton: { padding: 16, borderRadius: 30, alignItems: 'center', marginBottom: 20 },
  startButton: { backgroundColor: '#007AFF' },
  stopButton: { backgroundColor: '#FF3B30' },
  section: { backgroundColor: '#fff', padding: 16, borderRadius: 10, marginBottom: 16 },
  subtitle: { fontSize: 14, fontWeight: 'bold', color: '#666' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  addAllText: { color: '#007AFF', fontWeight: 'bold' },
  textInput: { minHeight: 80, borderColor: '#eee', borderWidth: 1, borderRadius: 8, padding: 10, textAlignVertical: 'top' },
  convertButton: { backgroundColor: '#34C759', padding: 12, borderRadius: 8, marginTop: 10, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  todoCard: { flexDirection: 'row', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee', alignItems: 'center' },
  todoInfo: { flex: 1 },
  todoTask: { fontSize: 16, fontWeight: '500', color: '#333' },
  todoDate: { fontSize: 12, color: '#007AFF', marginTop: 2 },
  todoDescription: { fontSize: 12, color: '#777', marginTop: 2 },
  actionButtons: { flexDirection: 'row', gap: 8 },
  addButton: { backgroundColor: '#007AFF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  removeButton: { backgroundColor: '#999', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  actionText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
});