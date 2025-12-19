// app/(tabs)/CalendarScreen.tsx
import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, Button } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { useItemsManager } from '../../hooks/use-items-manager';
import { Item } from '../../db/db-service';
import { useRouter } from 'expo-router';
import { COLORS } from '../../utils/status-color-util';
import { TaskItem } from '../../components/common/TaskItem';

const CalendarScreen = () => {
  const router = useRouter();
  const { items, updateItem } = useItemsManager();

  // 選択された日付 (yyyy-mm-dd 形式)
  const [selectedDate, setSelectedDate] = useState(new Date().toLocaleDateString("ja-JP", {year: "numeric",month: "2-digit",day: "2-digit"}).replaceAll('/', '-'));

  // --- 1. カレンダーに表示する「マーク（ドット）」の生成 ---
  const markedDates = useMemo(() => {
    const marks: any = {};

    items.forEach((item) => {
      if (!item.datetime_at) return;
      const dateStr = new Date(item.datetime_at).toLocaleDateString("ja-JP", {year: "numeric",month: "2-digit",day: "2-digit"}).replaceAll('/', '-');

      // 未完了タスクのみドットを表示
      if (!item.is_done) {
        if (!marks[dateStr]) {
          marks[dateStr] = { dots: [] };
        }

        // 期限に基づいた色判定（簡易版）
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const diff = Math.ceil((item.datetime_at - today.getTime()) / (86400000));
        const color = diff <= 3 ? COLORS.danger : diff <= 7 ? COLORS.warning : COLORS.success;

        // 同じ日に複数のドットを表示可能（最大3つ程度が綺麗です）
        if (marks[dateStr].dots.length < 3) {
          marks[dateStr].dots.push({ key: item.id.toString(), color });
        }
      }
    });


    // 選択中の日付にハイライトを適用
    marks[selectedDate] = {
      ...marks[selectedDate],
      selected: true,
      selectedColor: COLORS.selected,
    };

    return marks;
  }, [items, selectedDate]);


  // --- 2. 選択された日のタスクを抽出 ---
  const dailyItems = useMemo(() => {
    return items.filter(it =>
      it.datetime_at && new Date(it.datetime_at).toLocaleDateString("ja-JP", {year: "numeric",month: "2-digit", day: "2-digit"}).replaceAll('/', '-') >= selectedDate
    );
  }, [items, selectedDate]);

  // --- 3. その日の統計 ---
  const dailyStats = useMemo(() => {
    const s = { red: 0, yellow: 0, green: 0, done: 0 };
    dailyItems.forEach(it => {
      if (it.is_done) s.done++;
      else {
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const diff = Math.ceil((it.datetime_at! - today.getTime()) / (86400000));
        if (diff <= 3) s.red++;
        else if (diff <= 7) s.yellow++;
        else s.green++;
      }
    });
    return s;
  }, [dailyItems]);

  return (
    <View style={styles.container}>
      <Calendar
        onDayPress={(day: DateData) => setSelectedDate(day.dateString)}
        markedDates={markedDates}
        markingType={'multi-dot'} // 複数のドットを表示する設定
        theme={{
          selectedDayBackgroundColor: COLORS.selected,
          todayTextColor: COLORS.selected,
          arrowColor: COLORS.selected,
        }}
      />

      <View style={styles.detailContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.dateTitle}>{selectedDate} の状況</Text>
          <View style={styles.badgeRow}>
            {dailyStats.red > 0 && <Text style={[styles.miniBadge, { backgroundColor: COLORS.danger }]}>{dailyStats.red}</Text>}
            {dailyStats.yellow > 0 && <Text style={[styles.miniBadge, { backgroundColor: COLORS.warning, color: '#000' }]}>{dailyStats.yellow}</Text>}
            {dailyStats.green > 0 && <Text style={[styles.miniBadge, { backgroundColor: COLORS.success }]}>{dailyStats.green}</Text>}
          </View>
        </View>

        <FlatList
          data={dailyItems}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TaskItem
              item={item}
              onEdit={(id) => router.push(`../edit-item/${id}`)}
              displayMode="detail" // 詳細を表示
            />
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>この日のタスクはありません</Text>}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' , paddingTop: 45},
  detailContainer: { flex: 1, padding: 20, backgroundColor: '#f9f9f9' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  dateTitle: { fontSize: 18, fontWeight: 'bold' },
  badgeRow: { flexDirection: 'row', gap: 5 },
  miniBadge: { width: 24, height: 24, borderRadius: 12, textAlign: 'center', color: '#fff', fontWeight: 'bold', lineHeight: 24, overflow: 'hidden' },
  taskItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, backgroundColor: '#fff', borderRadius: 8, marginBottom: 8, elevation: 1 },
  taskTitle: { fontSize: 16, flex: 1 },
  doneText: { textDecorationLine: 'line-through', color: '#aaa' },
  emptyText: { textAlign: 'center', marginTop: 30, color: '#999' }
});

export default CalendarScreen;