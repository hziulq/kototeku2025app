// components/common/DataLoader.tsx
import React from 'react';
import { View, Text, Button, ActivityIndicator, StyleSheet } from 'react-native';

interface DataLoaderProps {
  isLoading: boolean;
  isReady: boolean;
  errorText?: string;
  onRetry: () => void;
  children: React.ReactNode;
}

export const DataLoader: React.FC<DataLoaderProps> = ({
  isLoading,
  isReady,
  errorText = "データベースに接続できませんでした。",
  onRetry,
  children,
}) => {
  // 1. ロード中
  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.statusText}>データを読み込み中...</Text>
      </View>
    );
  }

  // 2. 接続エラーまたは準備未完了
  if (!isReady) {
    return (
      <View style={styles.center}>
        <Text style={[styles.header, { color: 'red' }]}>接続エラー</Text>
        <Text style={styles.statusText}>{errorText}</Text>
        <Button title="再試行" onPress={onRetry} />
      </View>
    );
  }

  // 3. 正常時
  return <>{children}</>;
};

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  statusText: { fontSize: 16, marginBottom: 20, color: '#555' },
});