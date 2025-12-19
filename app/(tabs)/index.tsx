import { View, Text, Button, FlatList, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CalendarView } from '@/components/calendar';
import { CalendarEvent } from '@/components/types/calendar-type';

import { useMemo } from 'react';

import { useItemsManager } from '../../hooks/use-items-manager';
import { DataLoader } from '../../components/common/DataLoader';
import { convertItemToCalendarEvent } from '@/utils/event-conerter';

export default function HomeScreen() {
  const today = new Date();
  const monthLabel = today.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' });

  const {
    items,
    isDBConnectionReady,
    isInitialLoading,
    loadItems,
    addItem,
    deleteItem,
    clearAllItems,
    updateItem,
  } = useItemsManager();


  const sampleEvents: CalendarEvent[] = useMemo(() => {
    // 初期データがあるならそれを含める
    const initialEvents: CalendarEvent[] = [];
    //[
    //   { date: '2025-12-05', title: '〆切 A', level: 2 },
    //   { date: '2025-12-05', title: '〆切 A', level: 2 },
    //   { date: '2025-12-05', title: 'レビュー', level: 2 },
    //   { date: '2025-12-12', title: 'MTG', level: 3 },
    //   { date: '2025-12-22', title: 'リリース', level: 3 },
    //   { date: '2025-12-22', title: 'QA', level: 2 },
    //   { date: '2025-12-28', title: '打ち上げ', level: 1 },
    // ];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // items を加工して新しい配列を作成
    const dbEvents = items.map(it => convertItemToCalendarEvent(it, today));


    return [...initialEvents, ...dbEvents];
  }, [items]);

  const highPriorityCount = sampleEvents.filter((ev) => (ev.level ?? 1) >= 3).length;
  const safeAreaBg =
    highPriorityCount >= 3
      ? '#fa8072'
      : highPriorityCount === 2
        ? '#fcd575'
        : highPriorityCount === 1
          ? '#69b076'
          : '#69b076';

  return (

    <DataLoader
      isLoading={isInitialLoading}
      isReady={isDBConnectionReady}
      onRetry={loadItems}
    >
      <SafeAreaView style={[styles.safeArea, { backgroundColor: safeAreaBg }]}>
        <ThemedView style={styles.header}>
          <ThemedText type="title">現在：{monthLabel}</ThemedText>
        </ThemedView>
        <CalendarView events={sampleEvents} />
      </SafeAreaView>
    </DataLoader>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    alignItems: 'flex-start',
    backgroundColor: 'transparent',
  },
});
