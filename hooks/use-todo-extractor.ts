// hooks/use-todo-extractor.ts
import { useState } from 'react';
import { Alert } from 'react-native';

/**
 * OpenAI APIキーの設定
 * 環境変数から取得するか、デフォルト値を設定します。
 */
const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY || 'YOUR_OPENAI_API_KEY_HERE';

/**
 * 抽出されるTODOアイテムの型定義
 */
export type TodoItem = {
  /** タスクの内容 */
  task: string;
  /** 締切日 (ISO 8601形式: YYYY-MM-DD または 未設定時はnull) */
  deadline: string | null;
  /** タスクの補足説明（任意） */
  description?: string;
};

/**
 * テキストからTODOを抽出するためのカスタムフック
 * * @returns {Object} 
 * - todos: 抽出されたTODOリストのステート
 * - isProcessing: API通信中のフラグ
 * - extractTodos: テキスト解析を実行する関数
 * - setTodos: 抽出結果を外部から更新するための関数
 */
export const useTodoExtractor = () => {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  /**
   * 入力されたテキストからAIを用いてTODOを抽出します
   * * @param {string} rawText - 解析対象のテキスト（文字起こしデータ等）
   * @returns {Promise<TodoItem[] | undefined>} 抽出されたTODOの配列。失敗時はundefinedを返します。
   */
  const extractTodos = async (rawText: string) => {
    if (!rawText) return;

    setIsProcessing(true);
    // AIが相対的な日付（明日など）を計算できるように、実行時の今日の日付を取得
    const today = new Date().toISOString().split('T')[0];

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { 
              role: "system", 
              content: `あなたは優秀なタスク管理アシスタントです。文字起こしテキストから将来のTODOを抽出し、以下のJSON形式のみで返してください。
              {"todos": [{"task": "タスク名", "deadline": "YYYY-MM-DDまたはnull", "description": "詳細説明（任意）"}]}
              相対的な表現（明日、明後日など）は、今日の日付（${today}）を基準に計算してください。` 
            },
            { role: "user", content: rawText }
          ],
          // JSON Modeを有効化し、レスポンスの安定性を高める
          response_format: { type: "json_object" } 
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // 文字列として返ってくるcontentをパースしてJSONオブジェクトに変換
      const parsed = JSON.parse(data.choices[0].message.content);
      const extractedTodos = parsed.todos || [];
      
      setTodos(extractedTodos);
      return extractedTodos as TodoItem[];
    } catch (err) {
      console.error('OpenAI Error:', err);
      Alert.alert('AI解析エラー', 'TODOの抽出に失敗しました。ネットワーク状況やAPIキーを確認してください。');
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    todos,
    isProcessing,
    extractTodos,
    setTodos // ユーザーが後から手動で修正・追加するために提供
  };
};