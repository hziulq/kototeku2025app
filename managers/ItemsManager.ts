import { Item } from '../hooks/use-database';
import { ItemsDAO } from '../dao/items-dao';
import { Alert } from 'react-native';

// データ変更後にUIに通知するためのコールバック関数の型
type DataChangeListener = (items: Item[]) => void;

/**
 * アイテムデータの永続化ロジックを管理するシングルトンクラス (ビジネスロジック層)。
 * UIの状態管理から完全に独立し、データ同期のみを担います。
 */
export class ItemsManager {
  private static instance: ItemsManager;
  private items: Item[] = [];
  private dataListeners: DataChangeListener[] = [];

  private constructor() {}

  public static getInstance(): ItemsManager {
    if (!ItemsManager.instance) {
      ItemsManager.instance = new ItemsManager();
    }
    return ItemsManager.instance;
  }

  // --- リスナー管理 --------------------------------------------------------

  public subscribe(dataListener: DataChangeListener): () => void {
    this.dataListeners.push(dataListener);
    
    // 初期データをすぐにリスナーに提供
    dataListener(this.items);
    
    // アンサブスクライブ関数を返す
    return () => {
      this.dataListeners = this.dataListeners.filter(l => l !== dataListener);
    };
  }

  private notifyDataChange() {
    this.dataListeners.forEach(listener => listener(this.items));
  }

  // --- データ操作 ----------------------------------------------------------

  /**
   * 全てのアイテムをロードし、内部状態を更新する (SELECT)
   */
  public async loadItems(): Promise<void> {
    try {
      // ローディング状態の管理はフック側に任せ、クラス内では純粋にDAOを叩く
      this.items = await ItemsDAO.getAllItems();
      this.notifyDataChange();
    } catch (e) {
      console.error("Failed to load items:", e);
      // ここでエラーアラートは出さず、呼び出し元（フック/UI）に任せる
      throw e; 
    }
  }

  // addItem, deleteItem, clearAllItems も同様にローディング通知を削除し、
  // 処理後に loadItems() を呼び出してデータ同期を行う
  
  public async addItem(value: string): Promise<void> {
    try {
      await ItemsDAO.insertItem(value);
      await this.loadItems(); // データ変更があったため、再ロードして同期
    } catch (e) {
      console.error("Failed to add item:", e);
      Alert.alert("エラー", "アイテムの追加に失敗しました。");
      throw e; 
    }
  }

  public async deleteItem(id: number): Promise<void> {
    try {
      await ItemsDAO.deleteItem(id);
      await this.loadItems();
    } catch (e) {
      console.error("Failed to delete item:", e);
      Alert.alert("エラー", "アイテムの削除に失敗しました。");
      throw e; 
    }
  }

  public async clearAllItems(): Promise<void> {
    try {
      await ItemsDAO.clearAllItems();
      await this.loadItems();
    } catch (e) {
      console.error("Failed to clear items:", e);
      Alert.alert("エラー", "全アイテムのクリアに失敗しました。");
      throw e; 
    }
  }
}