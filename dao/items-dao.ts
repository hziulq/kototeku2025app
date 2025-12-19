// dao/items-dao.ts
import { getDatabaseConnection, Item, NewItem } from '../db/db-service';
// SQLiteDatabaseの型は、getDatabaseConnectionの戻り値として利用されます

/**
 * @namespace ItemsDAO
 * @description 
 * Itemsテーブルに対するデータアクセス層（Data Access Object: DAO）。
 * データベースへのCRUD操作（作成、読み取り、更新、削除）を提供します。
 * すべてのメソッドは、操作実行前に `getDatabaseConnection()` を呼び出し、
 * データベース接続の初期化を保証しています。
 */
export const ItemsDAO = {

  /**
   * 全てのアイテムを最終更新日時の降順で取得する。
   * @async
   * @function getAllItems
   * @returns {Promise<Item[]>} Itemオブジェクトの配列。
   * @throws {Error} DB操作に失敗した場合。
   */
  getAllItems: async (): Promise<Item[]> => {
    // 確実に初期化が完了するまで待機する
    const db = await getDatabaseConnection();

    try {
      // db.getAllAsync(sql, params) を使用
      const result = await db.getAllAsync<Item>(`
        SELECT *
        FROM items 
        ORDER BY datetime_at ASC;
      `);
      return result;
    } catch (error) {
      console.error("Error getting all items:", error);
      throw error;
    }
  },

  /**
   * 指定されたIDに一致する単一のアイテムを取得する。
   * @async
   * @function getItemById
   * @param {number} id 取得するアイテムのID。
   * @returns {Promise<Item | null>} 一致するItemオブジェクト、見つからない場合は null。
   * @throws {Error} DB操作に失敗した場合。
   */
  getItemById: async (id: number): Promise<Item | null> => {
    // 確実に初期化が完了するまで待機する
    const db = await getDatabaseConnection();
    try {
      const result = await db.getAllAsync<Item>(
        'SELECT * FROM items WHERE id = ?',
        [id]
      );
      return result[0] || null;
    } catch (error) {
      console.error(`Error getting item with id ${id}:`, error);
      throw error;
    }
  },

  /**
     * 新しいアイテムをデータベースに挿入する。
     * `updated_at` は挿入時に現在時刻 (Date.now()) で自動設定されます。
     * @async
     * @function insertItem
     * @param {NewItem} newItem 挿入する値 (IDとupdated_atを含まない)。
     * @returns {Promise<number>} 挿入されたアイテムのID (lastInsertRowId)。
     * @throws {Error} DB操作に失敗した場合。
     */
  insertItem: async (newItem: NewItem): Promise<number> => {
    // 確実に初期化が完了するまで待機する
    const db = await getDatabaseConnection();

    try {
      const now = Date.now();
      const result = await db.runAsync(`
        INSERT INTO items (title, description, updated_at, datetime_at)
        VALUES (?, ?, ?, ?)
        `,
        [newItem.title, newItem.description, now, newItem.datetime_at]
      );

      return result.lastInsertRowId;

    } catch (error) {
      console.error("Error inserting item:", error);
      throw error;
    }
  },

  /**
   * 指定したIDのアイテムを削除する。
   * @async
   * @function deleteItem
   * @param {number} id 削除するアイテムのID。
   * @returns {Promise<number>} 削除された行数 (`result.changes`)。成功時は通常 1。
   * @throws {Error} DB操作に失敗した場合。
   */
  deleteItem: async (id: number): Promise<number> => {
    // 確実に初期化が完了するまで待機する
    const db = await getDatabaseConnection();

    try {
      const result = await db.runAsync(
        'DELETE FROM items WHERE id = ?',
        [id]
      );

      return result.changes;

    } catch (error) {
      console.error(`Error deleting item with id ${id}:`, error);
      throw error;
    }
  },

  /**
   * 指定したIDのアイテムの値を更新する。
   * `updated_at` は更新時に現在時刻 (Date.now()) で自動更新されます。
   * @async
   * @function updateItem
   * @param {number} id 更新するアイテムのID。
   * @param {NewItem} newItem 更新する新しい値 (NewItem型だが、is_doneは更新対象)。
   * @returns {Promise<number>} 更新された行数 (`result.changes`)。成功時は通常 1。
   * @throws {Error} DB操作に失敗した場合。
   */
  updateItem: async (id: number, newItem: NewItem): Promise<number> => {
    // 確実に初期化が完了するまで待機する
    const db = await getDatabaseConnection();

    try {
      const result = await db.runAsync(
        `
        UPDATE items
        SET is_done = ?, title = ?, description = ?, updated_at = ?, datetime_at = ?
        WHERE id = ?
        `,
        [newItem.is_done, newItem.title, newItem.description, Date.now(), newItem.datetime_at, id]
      );

      return result.changes;

    } catch (error) {
      console.error(`Error updating item with id ${id}:`, error);
      throw error;
    }
  },

  /**
   * データベースの `items` テーブルから全てのアイテムを削除する (クリア操作)。
   * @async
   * @function clearAllItems
   * @returns {Promise<void>} 
   * @throws {Error} DB操作に失敗した場合。
   */
  clearAllItems: async (): Promise<void> => {
    // 確実に初期化が完了するまで待機する
    const db = await getDatabaseConnection();

    try {
      await db.runAsync('DELETE FROM items');
    } catch (error) {
      console.error("Error clearing all items:", error);
      throw error;
    }
  }
};