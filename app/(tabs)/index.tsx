import { Image } from 'expo-image';
import { Platform, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link } from 'expo-router';


export default function HomeScreen() {
  const today = new Date();
  const dateString = today.toLocaleDateString("ja-JP");
  const insets = useSafeAreaInsets();

  return (
      <>
        <ThemedView style={[styles.safeAreaBlock, { height: insets.top }]} />

        <ThemedView style={styles.stepContainer}>
          <ThemedText type='subtitle'>
            {dateString}
          </ThemedText>
        </ThemedView>
      </>
  );
}

const styles = StyleSheet.create({
  safeAreaBlock: {
    width: '100%',
    backgroundColor: '#A1CEDC'
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
