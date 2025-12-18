import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CalendarView } from '@/components/calendar';

export default function HomeScreen() {
  const today = new Date();
  const monthLabel = today.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' });

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">{monthLabel}</ThemedText>
      </ThemedView>
      <CalendarView />
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
    backgroundColor: '#fa8072',
  },
});
