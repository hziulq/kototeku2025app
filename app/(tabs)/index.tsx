import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CalendarView } from '@/components/calendar';
import { CalendarEvent } from '@/components/types/calendar-type';

export default function HomeScreen() {
  const today = new Date();
  const monthLabel = today.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' });

  const sampleEvents: CalendarEvent[] = [
    { date: '2025-12-05', title: '〆切 A', level: 2 },
    { date: '2025-12-05', title: 'レビュー', level: 2 },
    { date: '2025-12-12', title: 'MTG', level: 3 },
    { date: '2025-12-22', title: 'リリース', level: 3 },
    { date: '2025-12-22', title: 'QA', level: 2 },
    { date: '2025-12-28', title: '打ち上げ', level: 3 },
  ];

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
    <SafeAreaView style={[styles.safeArea, { backgroundColor: safeAreaBg }]}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">{monthLabel}</ThemedText>
      </ThemedView>
      <CalendarView events={sampleEvents} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fa8072',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    alignItems: 'flex-start',
    backgroundColor: 'transparent',
  },
});
