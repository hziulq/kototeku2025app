// hooks/use-database.ts

import { useState, useEffect } from 'react';
// db-serviceから接続関数をインポート
import { getDatabaseConnection } from '../db/db-service'; 

export const useDatabase = () => {
  const [isDBReady, setIsDBReady] = useState(false);

  useEffect(() => {
    getDatabaseConnection()
      .then(() => setIsDBReady(true))
      .catch(() => setIsDBReady(false));
  }, []);

  return { isDBReady };
};