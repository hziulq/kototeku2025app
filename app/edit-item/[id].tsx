import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, Text, ActivityIndicator, TouchableOpacity, Platform, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useItemsManager } from '../../hooks/use-items-manager';
import { ItemsDAO } from '../../dao/items-dao';
import { NewItem } from '../../db/db-service';

export default function EditItemScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { updateItem, deleteItem } = useItemsManager();

  const [isLoading, setIsLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [datetimeAt, setDatetimeAt] = useState<number | null>(null);
  const [isDone, setIsDone] = useState(false); // 完了状態の管理
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    async function fetchItem() {
      try {
        const item = await ItemsDAO.getItemById(Number(id));
        if (item) {
          setTitle(item.title);
          setDescription(item.description || '');
          setDatetimeAt(item.datetime_at);
          setIsDone(!!item.is_done);
        }
      } finally {
        setIsLoading(false);
      }
    }
    fetchItem();
  }, [id]);

  // ステータスをトグルする
  const handleToggleDone = () => {
    setIsDone(!isDone);
  };

  const handleSave = async () => {
    const updatedData: NewItem = {
      title,
      description,
      is_done: isDone, // 変更した完了状態を保存
      datetime_at: datetimeAt,
    };
    await updateItem(Number(id), updatedData);
    router.back();
  };

  const handleDelete = () => {
    Alert.alert("タスクの削除", "このタスクを削除してもよろしいですか？", [
      { text: "キャンセル", style: "cancel" },
      {
        text: "削除", style: "destructive", onPress: async () => {
          await deleteItem(Number(id));
          router.back();
        }
      }
    ]);
  };

  if (isLoading) return <ActivityIndicator style={styles.center} size="large" />;

  return (
    <View style={styles.container}>
      {/* ステータス表示バッジ */}
      <View style={[styles.statusBadge, isDone ? styles.badgeDone : styles.badgeTodo]}>
        <Text style={styles.statusText}>{isDone ? "✅ 完了済み" : "⏳ 未完了"}</Text>
      </View>

      <Text style={styles.label}>タイトル</Text>
      <TextInput style={styles.input} value={title} onChangeText={setTitle} />

      <Text style={styles.label}>詳細</Text>
      <TextInput style={[styles.input, styles.textArea]} value={description} onChangeText={setDescription} multiline />

      <Text style={styles.label}>期限</Text>
      <TouchableOpacity onPress={() => setShowPicker(true)} style={styles.dateDisplay}>
        <Text style={styles.dateText}>
          {datetimeAt ? new Date(datetimeAt).toLocaleDateString() : '未設定 (タップして選択)'}
        </Text>
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={datetimeAt ? new Date(datetimeAt) : new Date()}
          mode="date"
          display="default"
          onChange={(e, date) => {
            setShowPicker(Platform.OS === 'ios');
            if (date) setDatetimeAt(date.getTime());
          }}
        />
      )}

      <Button title="変更を保存" onPress={handleSave} color="#007AFF" />
      <Button title="キャンセル" color="gray" onPress={() => router.back()} />

      <View style={styles.buttonContainer}>
        {/* ステータス切り替えボタン */}
        <TouchableOpacity
          style={[styles.toggleButton, isDone ? styles.btnUndo : styles.btnComplete]}
          onPress={handleToggleDone}
        >
          <Text style={styles.toggleButtonText}>
            {isDone ? "未完了に戻す" : "完了にする"}
          </Text>
        </TouchableOpacity>

        <View style={styles.deleteWrapper}>
          <Button title="このタスクを削除" onPress={handleDelete} color="#FF3B30" />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center' },
  label: { fontWeight: 'bold', marginTop: 15, color: '#333' },
  input: { borderBottomWidth: 1, borderColor: '#ccc', padding: 10, fontSize: 16 },
  textArea: { height: 80, textAlignVertical: 'top' },
  dateDisplay: { padding: 15, backgroundColor: '#f0f0f0', borderRadius: 8, marginTop: 10 },
  dateText: { fontSize: 16, color: '#007AFF', textAlign: 'center' },

  // ステータスバッジのスタイル
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginBottom: 10 },
  badgeTodo: { backgroundColor: '#FFF9C4' }, // 薄い黄色
  badgeDone: { backgroundColor: '#C8E6C9' }, // 薄い緑
  statusText: { fontSize: 14, fontWeight: 'bold', color: '#555' },

  buttonContainer: { marginTop: 30, gap: 10 },

  // トグルボタンのスタイル
  toggleButton: { padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 10 },
  btnComplete: { backgroundColor: '#34C759' }, // 完了用は緑
  btnUndo: { backgroundColor: '#FFCC00' },     // 戻す用はオレンジ
  toggleButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  deleteWrapper: { marginTop: 20, borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 20 }
});