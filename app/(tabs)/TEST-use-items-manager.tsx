// app/(tabs)/TEST-use-items-manager.tsx
/* README:
  * このファイルはアプリケーションのSQLiteデータベース機能 (CRUD操作) をテストするためのメイン画面コンポーネントです。
  * useItemsManager フックを通じて、データ状態、接続状態、および操作メソッドを取得します。
  */
import React, { useMemo, useState } from 'react';
import { View, Text, Button, FlatList, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { useItemsManager } from '../../hooks/use-items-manager';
import { Item, NewItem } from '../../db/db-service';
import { DataLoader } from '../../components/common/DataLoader';
import { getStatusColor, COLORS } from '../../utils/status-color-util';

import { useRouter } from 'expo-router'; // 追加
import { TaskItem } from '@/components/common/TaskItem';


// フィルタリング用の型定義
type FilterStatus = 'all' | 'todo' | 'done';

/**
 * @component TestScreen
 * @description 
 * アプリケーションのSQLiteデータベース機能 (CRUD操作) をテストするためのメイン画面コンポーネント。
 * useItemsManager フックを通じて、データ状態、接続状態、および操作メソッドを取得します。
 * * 画面の表示フロー:
 * 1. isInitialLoading: ロード中 (スピナーを表示)
 * 2. !isDBConnectionReady: 接続エラー発生 (エラーメッセージと再試行ボタンを表示)
 * 3. 接続完了: 通常のCRUD操作UIとアイテムリストを表示
 */
const TestScreen: React.FC = () => {
  const router = useRouter(); // routerを取得
  // useItemsManager フックから状態と操作メソッドを取得
  const {
    items,
    isDBConnectionReady, // DB接続と初期ロードが完了しているか
    isInitialLoading,    // 初回ロード中か
    loadItems,
    addItem,
    deleteItem,
    updateItem,
  } = useItemsManager();

  // フィルタ状態を管理
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');

  // --- 統計データの集計 ---
  const stats = useMemo(() => {
    const counts = { red: 0, yellow: 0, green: 0 };
    items.forEach(it => {
      if (it.is_done) return;
      const color = getStatusColor(it.datetime_at, false);
      if (color === COLORS.danger) counts.red++;
      else if (color === COLORS.warning) counts.yellow++;
      else counts.green++;
    });
    return counts;
  }, [items]);

  // --- フィルタリングロジック ---
  const filteredItems = useMemo(() => {
    switch (filterStatus) {
      case 'todo': return items.filter(it => !it.is_done);
      case 'done': return items.filter(it => it.is_done);
      default: return items;
    }
  }, [items, filterStatus]);

  // 1. --- 初期ローディング状態 ---
  if (isInitialLoading) {
    // ... ロード中のUI表示 ...
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.statusText}>データベースを準備中...</Text>
      </View>
    );
  }

  // 2. --- DB接続エラー状態 ---
  if (!isDBConnectionReady) {
    // ... 接続エラーのUI表示 ...
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={[styles.header, { color: 'red' }]}>接続エラー</Text>
        <Text style={styles.statusText}>データベースに接続できませんでした。</Text>
        <Button title="再試行" onPress={loadItems} />
      </View>
    );
  }

/**
 * @function handleAddItem
 * @description 新しいアイテムを作成し、DBに挿入後、その詳細画面へ遷移する。
 */
const handleAddItem = async () => {
  const newItem: NewItem = {
    title: ``, // デフォルトタイトル
    description: '',
    is_done: false,
    datetime_at: null, // デフォルトは今日
  };
  await addItem(newItem);
};

  /**
   * @function handleUpdateItem
   * @description 既存のアイテムを更新する。
   * @param {number} id 更新対象のID。
   */
  // handleUpdateItem を修正
  const handleEditPress = (id: number) => {
    // 編集画面へ遷移。IDをパスパラメータとして渡す
    router.push(`../edit-item/${id}`);
  };

  /**
   * @function renderItem
   * @description FlatList のレンダリング関数。個々のアイテムの表示と、編集/削除ボタンを定義。
   * @param {{item: Item}} item レンダリング対象のアイテムオブジェクト。
   */
  const renderItem = ({ item }: { item: Item }) => (
    <TaskItem
      item={item}
      onEdit={(id) => router.push(`../edit-item/${id}`)}
      displayMode="detail" // 保存時刻を表示
    />
  );

  // --- メインのレンダリング ---

  return (
    <View style={styles.container}>
      <DataLoader isLoading={isInitialLoading} isReady={isDBConnectionReady} onRetry={loadItems}>
        <Text style={styles.header}>タスク管理</Text>

        {/* 統計バッジの表示 */}
        <View style={styles.statsContainer}>
          <View style={[styles.statsBadge, { backgroundColor: COLORS.danger }]}>
            <Text style={styles.statsText}>至急: {stats.red}</Text>
          </View>
          <View style={[styles.statsBadge, { backgroundColor: COLORS.warning }]}>
            <Text style={[styles.statsText, { color: '#000' }]}>注意: {stats.yellow}</Text>
          </View>
          <View style={[styles.statsBadge, { backgroundColor: COLORS.success }]}>
            <Text style={styles.statsText}>余裕: {stats.green}</Text>
          </View>
        </View>

        {/* フィルタ切替ボタン */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterBtn, filterStatus === 'all' && styles.filterBtnActive]}
            onPress={() => setFilterStatus('all')}
          >
            <Text style={filterStatus === 'all' ? styles.whiteText : null}>すべて</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterBtn, filterStatus === 'todo' && styles.filterBtnActive]}
            onPress={() => setFilterStatus('todo')}
          >
            <Text style={filterStatus === 'todo' ? styles.whiteText : null}>未完了</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterBtn, filterStatus === 'done' && styles.filterBtnActive]}
            onPress={() => setFilterStatus('done')}
          >
            <Text style={filterStatus === 'done' ? styles.whiteText : null}>完了済</Text>
          </TouchableOpacity>
          <Button title="新規追加" onPress={() => handleAddItem()} />
        </View>

        {/* <View style={styles.buttonRow}>

        </View> */}

        <FlatList
          data={filteredItems} // フィルタリングされた配列を表示
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={<Text style={styles.emptyText}>該当するアイテムがありません。</Text>}
        />
      </DataLoader>
    </View>
  );
};

// スタイル定義
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' , paddingTop: 45},
  center: { justifyContent: 'center', alignItems: 'center' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 10, color: '#333' },
  statusText: { fontSize: 16, marginBottom: 20, color: '#555' },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  listHeader: { fontSize: 18, fontWeight: '600', marginTop: 20, marginBottom: 10, color: '#333' },
  list: { flex: 1 },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginVertical: 4,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
  },
  itemTextContainer: { flex: 1, marginRight: 10 },
  itemId: { fontSize: 12, color: '#999' },
  itemValue: { fontSize: 16, fontWeight: '500', color: '#000' },
  itemDate: { fontSize: 10, color: '#999', marginTop: 2 },
  emptyText: { textAlign: 'center', marginTop: 20, color: '#777' },

  filterRow: { flexDirection: 'row', marginBottom: 15, gap: 10 },
  filterBtn: { flex: 1, padding: 8, backgroundColor: '#ddd', borderRadius: 20, alignItems: 'center' },
  filterBtnActive: { backgroundColor: '#007AFF' },
  whiteText: { color: '#fff', fontWeight: 'bold' },
  itemContainerDone: { backgroundColor: '#f9f9f9', opacity: 0.7 },
  checkCircle: { marginRight: 15, padding: 5 },
  textDone: { textDecorationLine: 'line-through', color: '#aaa' },
  subText: { fontSize: 12, color: '#666' },

  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 8,
  },
  statsBadge: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
  },
  statsText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default TestScreen;