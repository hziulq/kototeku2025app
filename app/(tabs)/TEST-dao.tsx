// app/(tabs)/TEST-dao.tsx
/* README:
 * このファイルはデータベース操作をテストするための画面コンポーネントです。
 * useItemsManager フックを使用せず、DAO層に直接アクセスしてCRUD操作を行います。
 * これにより、ItemsManager やフックの影響を受けずに、純粋なデータアクセスロジックを検証できます。
*/
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Button, FlatList, StyleSheet, ActivityIndicator, Alert } from 'react-native';
// データベース接続のフック (初回起動時のみ使用)
import { useDatabase } from '../../hooks/use-database';
// DAOとデータ型を直接インポート
import { ItemsDAO } from '../../dao/items-dao'; 
import { Item, NewItem } from '../../db/db-service'; 

/**
 * @component TestClassicScreen
 * @description 
 * DAO層に直接アクセスし、アイテムデータのCRUD操作を行うテスト画面。
 * データのローディング状態、エラー処理、およびリストの状態管理を、このコンポーネント内で完結させます。
 */
const TestClassicScreen: React.FC = () => {
  // DBの接続/初期化状態のみをuseDatabaseから取得
  const { isDBReady } = useDatabase(); 

  /**
   * @private
   * @description データベースから取得したアイテムリスト。
   */
  const [items, setItems] = useState<Item[]>([]);

  /**
   * @private
   * @description データ操作（ロード、追加、削除など）が進行中かどうかを示すローディング状態。
   * 初回ロードだけでなく、CRUD操作中も使用します。
   */
  const [isLoading, setIsLoading] = useState(true);

  /**
   * @private
   * @description データベース接続または操作で致命的なエラーが発生したかどうかを示す状態。
   */
  const [hasError, setHasError] = useState(false);

  /**
   * @function loadItems
   * @description データベースから全てのアイテムを取得し、ローカルな状態を更新する。
   * @async
   */
  const loadItems = useCallback(async () => {
    if (!isDBReady) {
      // DBが準備できていなければ、ロードを試みない
      return;
    }
    
    setIsLoading(true);
    setHasError(false);
    try {
      const fetchedItems = await ItemsDAO.getAllItems();
      setItems(fetchedItems);
    } catch (e) {
      console.error("Failed to load items:", e);
      setHasError(true);
      Alert.alert("エラー", "アイテムの読み込みに失敗しました。");
    } finally {
      setIsLoading(false);
    }
  }, [isDBReady]);

  // --- ライフサイクル: DB準備完了時に初回ロードを実行 ---
  useEffect(() => {
    if (isDBReady) {
      loadItems();
    } else {
      // DB準備ができていなければ、ローディング状態を維持
      setIsLoading(true);
    }
  }, [isDBReady, loadItems]);

  // --- CRUD操作ハンドラ ---

  /**
   * @function handleAddItem
   * @description アイテムを追加し、成功したらリストを再ロードする。
   * @async
   */
  const handleAddItem = async () => {
    if (!isDBReady || isLoading) return; 

    const newItem: NewItem = {
      title: `Classic Item ${Date.now()}`,
      description: 'This is a test item via Classic Hook',
      is_done: false,
      datetime_at: null,
    };
    
    setIsLoading(true);
    try {
      await ItemsDAO.insertItem(newItem);
      // 成功後、リストを再取得して同期
      await loadItems(); 
    } catch (e) {
      console.error("Failed to add item:", e);
      Alert.alert("エラー", "アイテムの追加に失敗しました。");
    } finally {
      // loadItems() の中で既に setIsLoading(false) が呼ばれているため、ここでは不要だが、
      // 念のため、エラーパスでのみ setIsLoading(false) を実行するのも良い。
      // 今回は loadItems() 依存で簡潔にする。
      if (hasError) setIsLoading(false); 
    }
  };

  /**
   * @function handleDeleteItem
   * @description アイテムを削除し、成功したらリストを再ロードする。
   * @param {number} id 削除対象のID。
   * @async
   */
  const handleDeleteItem = async (id: number) => {
    if (!isDBReady || isLoading) return;
    
    setIsLoading(true);
    try {
      await ItemsDAO.deleteItem(id);
      await loadItems();
    } catch (e) {
      console.error("Failed to delete item:", e);
      Alert.alert("エラー", "アイテムの削除に失敗しました。");
    }
  };
  
  /**
   * @function handleClearAll
   * @description 全アイテムを削除し、リストを再ロードする (確認アラート付き)。
   * @async
   */
  const handleClearAll = () => {
    Alert.alert(
      "確認",
      "全てのアイテムを削除してもよろしいですか？",
      [
        { text: "キャンセル" },
        { 
          text: "削除", 
          style: 'destructive', 
          onPress: async () => {
            if (!isDBReady || isLoading) return;
            setIsLoading(true);
            try {
              await ItemsDAO.clearAllItems();
              await loadItems();
            } catch (e) {
              console.error("Failed to clear all items:", e);
              Alert.alert("エラー", "全アイテムのクリアに失敗しました。");
            }
          } 
        }
      ]
    );
  };
  
  // (注: updateItemハンドラは省略しますが、addItemと同様のパターンで実装されます)

  // --- UI レンダリング ---
  
  // 1. DBがまだ準備できていない、または操作が進行中の場合
  if (isLoading || !isDBReady) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.statusText}>
          {isDBReady ? "データを読み込み中..." : "データベースを初期化中..."}
        </Text>
      </View>
    );
  }

  // 2. 致命的なエラーが発生した場合
  if (hasError) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={[styles.header, { color: 'red' }]}>データアクセスエラー</Text>
        <Text style={styles.statusText}>データの取得/操作に失敗しました。</Text>
        <Button title="再試行" onPress={loadItems} />
      </View>
    );
  }

  // 3. 通常UI
  const renderItem = ({ item }: { item: Item }) => (
    <View style={styles.itemContainer}>
      <View style={styles.itemTextContainer}>
        <Text style={styles.itemId}>ID: {item.id}</Text>
        <Text style={styles.itemValue}>{item.title}</Text>
      </View>
      <Button
        title="削除"
        onPress={() => handleDeleteItem(item.id)}
        color="#ff6347"
        disabled={isLoading}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>DAO直接アクセス CRUD テスト</Text>
      <Text style={styles.statusText}>DBステータス: 接続完了</Text>

      <View style={styles.buttonRow}>
        <Button
          title="アイテムを追加 (INSERT)"
          onPress={handleAddItem}
          disabled={isLoading}
        />
        <Button
          title="リストを再読み込み (SELECT)"
          onPress={loadItems}
          disabled={isLoading}
        />
      </View>
      <Button
        title="全アイテムをクリア (DELETE ALL)"
        onPress={handleClearAll}
        color="#ff4500"
        disabled={isLoading}
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

// スタイル定義 (前のファイルと共通)
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
  emptyText: { textAlign: 'center', marginTop: 20, color: '#777' }
});

export default TestClassicScreen;