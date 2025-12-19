// managers/Itemsmanager.ts
import { Item, NewItem } from '../db/db-service';
import { ItemsDAO } from '../dao/items-dao';
import { Alert } from 'react-native';

/**
 * @type {DataChangeListener}
 * @description アイテムデータが変更されたときに呼び出されるコールバック関数の型定義。
 * 更新されたアイテムの配列を受け取ります。
 */
type DataChangeListener = (items: Item[]) => void;

/**
 * @class ItemsManager
 * @description 
 * アイテムデータの永続化ロジックと内部状態を管理するシングルトンクラス (ビジネスロジック層)。
 * このクラスは、データストア (DAO) と UI (リスナー経由) の間の仲介役として機能します。
 * データ操作（CRUD）を実行し、成功した場合に接続されている全てのリスナーに通知します。
 */
export class ItemsManager {
  /**
   * @private
   * @static
   * @type {ItemsManager}
   * @description シングルトンインスタンスを保持するための静的プライベート変数。
   */
  private static instance: ItemsManager;

  /**
   * @private
   * @type {Item[]}
   * @description データベースからロードされたアイテムの現在の内部状態。
   */
  private items: Item[] = [];

  /**
   * @private
   * @type {DataChangeListener[]}
   * @description 内部状態の変更を監視しているUIコンポーネント (フック) のコールバックリスト。
   */
  private dataListeners: DataChangeListener[] = [];

  /**
   * @private
   * @constructor
   * @description シングルトンのため、外部からのインスタンス化を禁止します。
   */
  private constructor() {}

  /**
   * ItemsManagerの唯一のインスタンスを取得する (シングルトン)。
   * インスタンスがまだ存在しない場合は作成します。
   * @static
   * @function getInstance
   * @returns {ItemsManager} シングルトンインスタンス。
   */
  public static getInstance(): ItemsManager {
    if (!ItemsManager.instance) {
      ItemsManager.instance = new ItemsManager();
    }
    return ItemsManager.instance;
  }

  // --- リスナー管理 --------------------------------------------------------

  /**
   * データ変更リスナーを登録し、現在のアイテムデータをすぐに提供する。
   * @public
   * @function subscribe
   * @param {DataChangeListener} dataListener 登録するコールバック関数。
   * @returns {() => void} 登録を解除するためのアンサブスクライブ関数。
   */
  public subscribe(dataListener: DataChangeListener): () => void {
    this.dataListeners.push(dataListener);
    
    // 初期データをすぐにリスナーに提供
    dataListener(this.items);
    
    // アンサブスクライブ関数を返す
    return () => {
      this.dataListeners = this.dataListeners.filter(l => l !== dataListener);
    };
  }

  /**
   * @private
   * @function notifyDataChange
   * @description 内部データ (`this.items`) が変更されたときに、全ての登録済みリスナーに新しいデータを通知する。
   */
  private notifyDataChange() {
    this.dataListeners.forEach(listener => listener(this.items));
  }

  // --- データ操作 ----------------------------------------------------------

  /**
   * データベースから全てのアイテムをロードし、内部状態を更新後、リスナーに通知する (SELECT)。
   * @public
   * @async
   * @function loadItems
   * @returns {Promise<void>}
   * @throws {Error} アイテムのロードに失敗した場合。
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

  /**
   * 新しいアイテムをデータベースに挿入し、その後 `loadItems` を呼び出して状態を同期する。
   * @public
   * @async
   * @function addItem
   * @param {NewItem} newItem 挿入するアイテムデータ。
   * @returns {Promise<void>}
   * @throws {Error} データベース操作に失敗した場合、アラートを表示してからエラーを再スロー。
   */
  public async addItem(newItem: NewItem): Promise<void> {
    try {
      await ItemsDAO.insertItem(newItem);
      await this.loadItems(); // データ変更があったため、再ロードして同期
    } catch (e) {
      console.error("Failed to add item:", e);
      Alert.alert("エラー", "アイテムの追加に失敗しました。");
      throw e; 
    }
  }

  /**
   * 指定したIDのアイテムをデータベースから削除し、その後 `loadItems` を呼び出して状態を同期する。
   * @public
   * @async
   * @function deleteItem
   * @param {number} id 削除するアイテムのID。
   * @returns {Promise<void>}
   * @throws {Error} データベース操作に失敗した場合、アラートを表示してからエラーを再スロー。
   */
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

  /**
   * 指定したIDのアイテムをデータベースで更新し、その後 `loadItems` を呼び出して状態を同期する。
   * @public
   * @async
   * @function updateItem
   * @param {number} id 更新するアイテムのID。
   * @param {NewItem} updatedItem 更新するアイテムデータ。
   * @returns {Promise<void>}
   * @throws {Error} データベース操作に失敗した場合、アラートを表示してからエラーを再スロー。
   */
  public async updateItem(id: number, updatedItem: NewItem): Promise<void> {
    try {
      await ItemsDAO.updateItem(id, updatedItem);
      await this.loadItems();
    }
    catch (e) {
      console.error("Failed to update item:", e);
      Alert.alert("エラー", "アイテムの更新に失敗しました。");
      throw e;
    }
  }

  /**
   * データベースの全てのアイテムを削除し、その後 `loadItems` を呼び出して状態をクリアし同期する。
   * @public
   * @async
   * @function clearAllItems
   * @returns {Promise<void>}
   * @throws {Error} データベース操作に失敗した場合、アラートを表示してからエラーを再スロー。
   */
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