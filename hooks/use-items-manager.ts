// hooks/use-items-manager.ts
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useDatabase } from './use-database';
import { Item, NewItem } from '../db/db-service';
import { ItemsManager } from '../managers/ItemsManager'; 

/**
 * @function useItemsManager
 * @description 
 * Reactコンポーネントがアイテムデータと永続化操作にアクセスするためのカスタムフック。
 * データベースの接続状態を待ち、初回ロードを実行した後、
 * ItemsManager からのデータ変更を購読し、最新のアイテムリストと操作関数を提供します。
 * * * 役割: 
 * 1. `useDatabase` を利用してDB接続/初期化の完了を待機する。
 * 2. DB準備完了後、ItemsManager から初回データをロードする。
 * 3. ItemsManager のデータ変更イベントを購読し、UIの状態を最新に保つ。
 * 4. ItemsManager のメソッドを React の `useCallback` でラップして提供する。
 * * @returns {{
 * items: Item[],
 * isDBConnectionReady: boolean,
 * isInitialLoading: boolean,
 * loadItems: () => Promise<void>,
 * addItem: (newItem: NewItem) => Promise<void>,
 * deleteItem: (id: number) => Promise<void>,
 * clearAllItems: () => Promise<void>,
 * updateItem: (id: number, newItem: NewItem) => Promise<void>
 * }} データと操作関数のオブジェクト。
 */
export const useItemsManager = () => {
  // DB接続/初期化状態を追跡
  const { isDBReady } = useDatabase();
  // ItemsManagerのシングルトンインスタンスをメモ化
  const manager = useMemo(() => ItemsManager.getInstance(), []); 

  /**
   * @type {[Item[], React.Dispatch<React.SetStateAction<Item[]>>]}
   * @description ItemsManagerから購読される現在のアイテムリスト。
   */
  const [items, setItems] = useState<Item[]>([]);
  
  /**
   * @type {[boolean, React.Dispatch<React.SetStateAction<boolean>>]}
   * @description DB準備完了後、最初のデータ取得が完了するまでのローディング状態。
   * ロードが完了するまでUIの表示をブロックするために使用されます。
   */
  const [isInitialLoading, setIsInitialLoading] = useState(true); 

  // --- 初期ロード処理 ---
  /**
   * @hook useEffect
   * @description `isDBReady` が true になった後、一度だけ `manager.loadItems()` を実行します。
   * ロード成功/失敗に関わらず、`isInitialLoading` を false に設定します。
   * @dependency [isDBReady, manager]
   */
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
  /**
   * @hook useEffect
   * @description ItemsManager の変更通知を購読し、ローカルな `items` 状態を更新します。
   * コンポーネントがアンマウントされるときに自動で購読解除します。
   * @dependency [manager]
   */
  useEffect(() => {
    const dataListener = (newItems: Item[]) => {
      setItems(newItems);
    };

    const unsubscribe = manager.subscribe(dataListener);
    return () => unsubscribe();
  }, [manager]);

  // --- 操作関数 (useCallbackによる安定化) ---

  /**
   * @constant loadItems
   * @description データストアからアイテムを再ロードする。
   */
  const loadItems = useCallback(() => manager.loadItems(), [manager]);

  /**
   * @constant addItem
   * @description 新しいアイテムを挿入し、データストアを同期する。
   * @param {NewItem} newItem 挿入するアイテムデータ。
   */
  const addItem = useCallback((newItem: NewItem) => manager.addItem(newItem), [manager]);
  
  /**
   * @constant deleteItem
   * @description 指定IDのアイテムを削除し、データストアを同期する。
   * @param {number} id 削除するアイテムのID。
   */
  const deleteItem = useCallback((id: number) => manager.deleteItem(id), [manager]);
  
  /**
   * @constant clearAllItems
   * @description 全てのアイテムを削除し、データストアを同期する。
   */
  const clearAllItems = useCallback(() => manager.clearAllItems(), [manager]);
  
  /**
   * @constant updateItem
   * @description 指定IDのアイテムを更新し、データストアを同期する。
   * @param {number} id 更新するアイテムのID。
   * @param {NewItem} newItem 更新するアイテムデータ。
   */
  const updateItem = useCallback((id: number, newItem: NewItem) => manager.updateItem(id, newItem), [manager]);

  return {
    // 状態: 必要なのはDB接続状態とアイテムリストのみ
    items,
    /**
     * @property isDBConnectionReady
     * @type {boolean}
     * @description DB接続が完了し、かつ初回データロードも完了している場合に true。
     * アプリケーションが完全に機能する状態を示すフラグ。
     */
    isDBConnectionReady: isDBReady && !isInitialLoading, 
    /**
     * @property isInitialLoading
     * @type {boolean}
     * @description DB初期化または初回データロードが完了していない場合に true。
     */
    isInitialLoading, 

    // 操作関数
    loadItems,
    addItem,
    deleteItem,
    clearAllItems,
    updateItem,
  };
};