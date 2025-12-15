// db/db-service.ts

import { SQLiteDatabase, openDatabaseAsync } from 'expo-sqlite'; 

// データベースインスタンスを保持するプライベート変数 (シングルトン)
let _db: SQLiteDatabase | null = null;
// 初期化プロセスが実行中の場合にそのPromiseを保持する
let _dbPromise: Promise<SQLiteDatabase> | null = null; 

// データベース名と初期化SQL (定数)
const DB_NAME = "app_database.db";
const INIT_SQL = `
  CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY NOT NULL, 
    value TEXT NOT NULL, 
    date REAL
  );
`;

/**
 * データベース接続を取得する。
 * 未接続の場合は初期化処理を行い、接続が確立されるまで待機する（シングルトン）。
 */
export const getDatabaseConnection = async (): Promise<SQLiteDatabase> => {
  if (_db) {
    return _db;
  }

  if (_dbPromise) {
    return _dbPromise;
  }

  // 初めての呼び出し: 初期化プロセスを開始
  _dbPromise = (async () => {
    try {
      const connection = await openDatabaseAsync(DB_NAME);
      await connection.execAsync(INIT_SQL);
      
      _db = connection;
      _dbPromise = null; // 初期化完了
      
      return connection;
    } catch (e) {
      console.error("Database initialization failed:", e);
      _dbPromise = null; // エラー発生時はリセット
      throw new Error("Failed to initialize database connection.");
    }
  })();
  
  return _dbPromise;
};

// DAOやManagerで使用されるデータ型もこのファイルで定義するのが一般的です
export interface Item {
  id: number;
  value: string;
  date: number;
}