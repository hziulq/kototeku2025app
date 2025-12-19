import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Button } from 'react-native';
import { Item } from '../../db/db-service';

import { getStatusColor as getTaskStatusColor } from '../../utils/status-color-util';
import { useItemsManager } from '../../hooks/use-items-manager';


interface TaskItemProps {
  item: Item;
  onEdit: (id: number) => void;
  displayMode: 'detail' | 'discription'; // 表示モードの指定
}

  

export const TaskItem: React.FC<TaskItemProps> = ({ item, onEdit, displayMode }) => {
  const statusColor = getTaskStatusColor(item.datetime_at, !!item.is_done);

  const { updateItem } = useItemsManager();

  // --- タスクの完了状態をトグルする ---
  const handleToggleDone = (item: Item) => {
    updateItem(item.id, {
      ...item,
      is_done: item.is_done ? false : true, // 完了状態を反転
    });
  };

  return (
    <View style={[
      styles.card, 
      item.is_done && styles.cardDone,
      !item.is_done && { borderLeftColor: statusColor, borderLeftWidth: 5 }
    ]}>
      <TouchableOpacity style={styles.checkCircle} onPress={() => handleToggleDone(item)}>
        <Text style={{ fontSize: 20 }}>{item.is_done ? '✅' : '○'}</Text>
      </TouchableOpacity>

      <View style={styles.textContainer}>
        <Text style={[styles.title, item.is_done && styles.textDone]}>{item.title}</Text>
        
        {/* モードによって表示を切り替え */}
        {displayMode === 'detail' ? (
          <>
            {item.description && <Text style={styles.subText}>📝 {item.description}</Text>}
            {item.datetime_at && (
              <Text style={[styles.subText, !item.is_done && { color: statusColor, fontWeight: 'bold' }]}>
                📅 {new Date(item.datetime_at).toLocaleDateString()}
              </Text>
            )}
          </>
        ) : displayMode === 'discription' ? (
          <Text style={styles.subText}>
            🕒 保存: {new Date(item.updated_at).toLocaleTimeString()}
          </Text>
        ) : null}
        
      </View>

      <Button title="編集" onPress={() => onEdit(item.id)} />
    </View>
  );
};

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', padding: 12, marginVertical: 4, backgroundColor: '#fff', borderRadius: 8, elevation: 2 },
  cardDone: { opacity: 0.6, backgroundColor: '#f0f0f0' },
  checkCircle: { marginRight: 12 },
  textContainer: { flex: 1 },
  title: { fontSize: 16, fontWeight: '500' },
  textDone: { textDecorationLine: 'line-through', color: '#888' },
  subText: { fontSize: 12, color: '#666', marginTop: 2 },
});