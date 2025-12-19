// db/db-service.ts

import { SQLiteDatabase, openDatabaseAsync } from 'expo-sqlite'; 

/**
 * @private
 * @type {SQLiteDatabase | null}
 * @description 
 * データベースインスタンスを保持するプライベート変数 (シングルトン)。
 * 接続が確立された後に使用されます。
 */
let _db: SQLiteDatabase | null = null;

/**
 * @private
 * @type {Promise<SQLiteDatabase> | null}
 * @description 
 * データベースの初期化プロセスが実行中の場合に、そのPromiseを保持します。
 * これにより、複数の同時接続要求に対して初期化が一度だけ実行されることを保証します。
 */
let _dbPromise: Promise<SQLiteDatabase> | null = null; 

/**
 * @constant
 * @type {string}
 * @description SQLiteデータベースのファイル名。
 */
const DB_NAME = "app_database.db";

/**
 * @constant
 * @type {string}
 * @description 
 * データベース初期化時に実行されるSQL文。
 * 項目データを管理するための `items` テーブルを作成します。
 * * itemsテーブル定義:
 * - id: INTEGER PRIMARY KEY NOT NULL
 * - is_done: INTEGER DEFAULT 0 (完了フラグ)
 * - title: TEXT
 * - description: TEXT
 * - updated_at: INTEGER (最終更新日時/UNIXタイムスタンプ)
 * - datetime_at: INTEGER (関連する日時/UNIXタイムスタンプ)
 */
const INIT_SQL = `
  CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY NOT NULL, 
    is_done INTEGER DEFAULT 0,
    title TEXT,
    description TEXT,
    updated_at INTEGER,
    datetime_at INTEGER
  );
  
`;

/**
 * データベース接続インスタンスを取得する (シングルトンパターン)。
 * * 未接続の場合は以下の初期化処理を行います:
 * 1. データベースファイルを開く (`openDatabaseAsync`)。
 * 2. 初期化SQLを実行し、必要なテーブル (items) を作成する。
 * * 複数の呼び出しが同時に発生しても、初期化は一度だけ実行されます。
 * * @async
 * @function
 * @returns {Promise<SQLiteDatabase>} 確立されたSQLiteデータベース接続インスタンス。
 * @throws {Error} データベースの初期化に失敗した場合。
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

/**
 * @interface
 * @description データベースの `items` テーブルの単一レコードに対応するデータ型。
 */
export interface Item {
  id: number;
  is_done: boolean;
  title: string;
  description: string | null;
  updated_at: number;
  datetime_at: number | null;
}

/**
 * @type
 * @description 
 * DBに新しい項目を挿入する際に使用するデータ型。
 * データベースが自動生成するフィールド (`id`, `updated_at`) を除外しています。
 */
export type NewItem = Omit<Item, 'id' | 'updated_at'>;

