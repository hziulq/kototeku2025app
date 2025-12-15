// app/(tabs)/TEST-use-items-manager.tsx
/* README:
  * このファイルはアプリケーションのSQLiteデータベース機能 (CRUD操作) をテストするためのメイン画面コンポーネントです。
  * useItemsManager フックを通じて、データ状態、接続状態、および操作メソッドを取得します。
  */
import React from 'react';
import { View, Text, Button, FlatList, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useItemsManager } from '../../hooks/use-items-manager';
import { Item, NewItem } from '../../db/db-service';

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
  // useItemsManager フックから状態と操作メソッドを取得
  const {
    items,
    isDBConnectionReady, // DB接続と初期ロードが完了しているか
    isInitialLoading,    // 初回ロード中か
    loadItems,
    addItem,
    deleteItem,
    clearAllItems,
    updateItem,
  } = useItemsManager();

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

  // 3. --- DB接続OKの場合の通常UI ---

  /**
   * @function handleAddItem
   * @description 新しいアイテムを作成し、DBに挿入する。
   */
  const handleAddItem = () => {
    const newItem: NewItem = {
      title: `Item ${Date.now()}`,
      description: 'This is a test item',
      is_done: false,
      datetime_at: null,
    };
    addItem(newItem);
  };

  /**
   * @function handleUpdateItem
   * @description 既存のアイテムを更新する。
   * @param {number} id 更新対象のID。
   * @param {NewItem} updatedItem 更新データ。
   */
  const handleUpdateItem = (id: number, updatedItem: NewItem) => {
    const newItem: NewItem = {
      title: updatedItem.title,
      description: updatedItem.description,
      is_done: updatedItem.is_done,
      datetime_at: updatedItem.datetime_at,
    };
    // updateItem に渡す前に、更新されたデータをユーザの入力に合わせて上書きする。
    // 現在はそのまま渡す。
    updateItem(id, newItem);
  };

  /**
   * @function handleDeleteItem
   * @description 指定したIDのアイテムを削除する。
   * @param {number} id 削除対象のID。
   */
  const handleDeleteItem = (id: number) => {
    deleteItem(id);
  };

  /**
   * @function handleClearAll
   * @description 全てのアイテムを削除する (確認アラート付き)。
   */
  const handleClearAll = () => {
    Alert.alert(
      "確認",
      "全てのアイテムを削除してもよろしいですか？",
      [
        { text: "キャンセル" },
        { text: "削除", style: 'destructive', onPress: () => clearAllItems() }
      ]
    );
  };

  /**
   * @function renderItem
   * @description FlatList のレンダリング関数。個々のアイテムの表示と、編集/削除ボタンを定義。
   * @param {{item: Item}} item レンダリング対象のアイテムオブジェクト。
   */
  const renderItem = ({ item }: { item: Item }) => (
    <View style={styles.itemContainer}>
      <View style={styles.itemTextContainer}>
        <Text style={styles.itemId}>ID: {item.id}</Text>
        <Text style={styles.itemValue}>{item.title}</Text>
        <Text style={styles.itemDate}>保存日時: {new Date(item.updated_at).toLocaleTimeString()}</Text>
      </View>
      <Button
        title="編集"
        onPress={() => handleUpdateItem(item.id, item)}
        color="#ff6347"
      // データ操作中のローディング状態は無視するため、ここではdisabledを使いません
      />
      <Button
        title="削除"
        onPress={() => handleDeleteItem(item.id)}
        color="#ff6347"
      // データ操作中のローディング状態は無視するため、ここではdisabledを使いません
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>SQLite CRUD テスト</Text>
      <Text style={styles.statusText}>DBステータス: 接続完了</Text>

      <View style={styles.buttonRow}>
        <Button
          title="アイテムを追加 (INSERT)"
          onPress={handleAddItem}
        />
        <Button
          title="リストを再読み込み (SELECT)"
          onPress={loadItems}
        />
      </View>
      <Button
        title="全アイテムをクリア (DELETE ALL)"
        onPress={handleClearAll}
        color="#ff4500"
      />

      <Text style={styles.listHeader}>保存されたアイテム ({items.length}件):</Text>

      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        style={styles.list}
        ListEmptyComponent={<Text style={styles.emptyText}>アイテムはまだありません。</Text>}
      />
    </View>
  );
};

// スタイル定義
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  center: { justifyContent: 'center', alignItems: 'center' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 10, color: '#333' },
  statusText: { fontSize: 16, marginBottom: 20, color: '#555' },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  listHeader: { fontSize: 18, fontWeight: '600', marginTop: 20, marginBottom: 10, color: '#333' },
  list: { flex: 1 },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
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
  emptyText: { textAlign: 'center', marginTop: 20, color: '#777' }
});

export default TestScreen;