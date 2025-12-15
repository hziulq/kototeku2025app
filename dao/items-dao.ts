import { getDatabaseConnection, Item } from '../db/db-service';
// SQLiteDatabaseの型は、getDatabaseConnectionの戻り値として利用されます

/**
 * Itemsテーブルに対するデータアクセス層（DAO）
 */
export const ItemsDAO = {

  /**
   * 全てのアイテムを取得する
   * @returns Itemの配列
   */
  getAllItems: async (): Promise<Item[]> => {
    // 確実に初期化が完了するまで待機する
    const db = await getDatabaseConnection(); 

    try {
      // db.getAllAsync(sql, params) を使用
      const result = await db.getAllAsync<Item>('SELECT id, value, date FROM items ORDER BY id DESC');
      return result;
    } catch (error) {
      console.error("Error getting all items:", error);
      throw error;
    }
  },

  /**
   * 新しいアイテムをデータベースに挿入する
   * @param value 挿入する値
   * @returns 挿入されたアイテムのID
   */
  insertItem: async (value: string): Promise<number> => {
    // 確実に初期化が完了するまで待機する
    const db = await getDatabaseConnection();

    try {
      const now = Date.now(); 
      const result = await db.runAsync(
        'INSERT INTO items (value, date) VALUES (?, ?)',
        [value, now]
      );

      return result.lastInsertRowId;

    } catch (error) {
      console.error("Error inserting item:", error);
      throw error;
    }
  },

  /**
   * 指定したIDのアイテムを削除する
   * @param id 削除するアイテムのID
   * @returns 削除された行数 (通常は 1)
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
   * 指定したIDのアイテムを更新する
   * @param id 更新するアイテムのID
   * @param newValue 新しい値
   * @returns 更新された行数 (通常は 1)
   */
  updateItem: async (id: number, newValue: string): Promise<number> => {
    // 確実に初期化が完了するまで待機する
    const db = await getDatabaseConnection();

    try {
      const result = await db.runAsync(
        'UPDATE items SET value = ? WHERE id = ?',
        [newValue, id]
      );
      
      return result.changes;
      
    } catch (error) {
      console.error(`Error updating item with id ${id}:`, error);
      throw error;
    }
  },

  /**
   * データベースから全てのアイテムを削除する (クリア)
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