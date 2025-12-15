// hooks/use-database.ts

import { useState, useEffect } from 'react';
// db-serviceから接続関数をインポート
import { getDatabaseConnection } from '../db/db-service'; 

/**
 * データベース接続の初期化ステータスを追跡するためのカスタムフック。
 * * アプリケーションマウント時に一度だけ `getDatabaseConnection` を呼び出し、
 * データベースの接続と初期化 (テーブル作成など) が完了したかどうかを管理します。
 * * @function useDatabase
 * @returns {{isDBReady: boolean}} 
 * - isDBReady: データベースが使用可能状態 (接続・初期化完了) であれば true。
 */
export const useDatabase = () => {
  /**
   * @type {[boolean, React.Dispatch<React.SetStateAction<boolean>>]}
   * @description データベースの初期化が完了したかどうかを示す状態。初期値は false。
   */
  const [isDBReady, setIsDBReady] = useState(false);

  /**
   * @hook useEffect
   * @description コンポーネントがマウントされたとき、一度だけデータベース接続を試行します。
   * @dependency [] 依存配列が空のため、コンポーネントのライフサイクルで一度だけ実行されます。
   */
  useEffect(() => {
    getDatabaseConnection()
      .then(() => setIsDBReady(true))
      .catch(() => setIsDBReady(false));
  }, []);

  return { isDBReady };
};