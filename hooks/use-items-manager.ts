import { useState, useEffect, useMemo, useCallback } from 'react';
import { Item, useDatabase } from './use-database';
import { ItemsManager } from '../managers/ItemsManager'; 

/**
 * DB接続と初期ロードのステータス、及びデータと操作を提供します。
 * 連続的なデータ操作中のローディング状態は隠蔽します。
 */
export const useItemsManager = () => {
  const { isDBReady } = useDatabase();
  const manager = useMemo(() => ItemsManager.getInstance(), []); 

  const [items, setItems] = useState<Item[]>([]);
  // DB準備完了後、最初のデータ取得が完了するまでの状態
  const [isInitialLoading, setIsInitialLoading] = useState(true); 

  // --- 初期ロード処理 ---
  useEffect(() => {
    if (isDBReady) {
      // DB準備完了後、すぐにロードを開始
      manager.loadItems()
        .catch(() => {
          // ロード失敗時（エラー処理はマネージャ内で行われる）
        })
        .finally(() => {
          setIsInitialLoading(false); // 初回ロード完了
        });
    } else {
      // DBが準備できていなければ、初期ロード状態に戻す
      setIsInitialLoading(true);
    }
  }, [isDBReady, manager]);

  // --- データ購読処理 ---
  useEffect(() => {
    const dataListener = (newItems: Item[]) => {
      setItems(newItems);
    };

    const unsubscribe = manager.subscribe(dataListener);
    return () => unsubscribe();
  }, [manager]);

  // --- 操作関数 (フック側で一時的なミューテーション状態を管理しない) ---

  const loadItems = useCallback(() => manager.loadItems(), [manager]);
  const addItem = useCallback((value: string) => manager.addItem(value), [manager]);
  const deleteItem = useCallback((id: number) => manager.deleteItem(id), [manager]);
  const clearAllItems = useCallback(() => manager.clearAllItems(), [manager]);

  return {
    // 状態: 必要なのはDB接続状態とアイテムリストのみ
    items,
    // TestScreenが接続不可を知るためのフラグ
    isDBConnectionReady: isDBReady && !isInitialLoading, 
    // 初回ロード完了前は表示をブロック
    isInitialLoading, 

    // 操作関数
    loadItems,
    addItem,
    deleteItem,
    clearAllItems,
  };
};