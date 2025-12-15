import React from 'react';
import { View, Text, Button, FlatList, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useItemsManager } from '../../hooks/use-items-manager'; 
import { Item } from '../../db/db-service'; 

const TestScreen: React.FC = () => {
  const { 
    items, 
    isDBConnectionReady, // DB接続と初期ロードが完了しているか
    isInitialLoading,    // 初回ロード中か
    loadItems, 
    addItem, 
    deleteItem,
    clearAllItems 
  } = useItemsManager(); 

  // DB接続不可または初回ロード中の場合は、ロード画面を表示
  if (isInitialLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.statusText}>データベースを準備中...</Text>
      </View>
    );
  }

  // 致命的なエラー（DB接続が確立できなかった場合など）
  if (!isDBConnectionReady) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={[styles.header, { color: 'red' }]}>接続エラー</Text>
        <Text style={styles.statusText}>データベースに接続できませんでした。</Text>
        <Button title="再試行" onPress={loadItems} />
      </View>
    );
  }

  // --- DB接続OKの場合の通常UI ---

  const handleAddItem = () => {
    const newItemValue = `新規アイテム (${new Date().toLocaleTimeString()})`;
    // 非同期操作だが、UI側は完了を待たず、マネージャーに任せる
    addItem(newItemValue);
  };
  
  const handleDeleteItem = (id: number) => {
    deleteItem(id);
  };

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

  const renderItem = ({ item }: { item: Item }) => (
    <View style={styles.itemContainer}>
      <View style={styles.itemTextContainer}>
        <Text style={styles.itemId}>ID: {item.id}</Text>
        <Text style={styles.itemValue}>{item.value}</Text>
        <Text style={styles.itemDate}>保存日時: {new Date(item.date).toLocaleTimeString()}</Text>
      </View>
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

// スタイルは省略
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