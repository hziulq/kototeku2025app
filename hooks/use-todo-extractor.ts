// hooks/use-todo-extractor.ts
import { useState } from 'react';
import { Alert } from 'react-native';

const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY || 'YOUR_OPENAI_API_KEY_HERE';

export type TodoItem = {
  task: string;
  deadline: string | null;
  description?: string;
};

export const useTodoExtractor = () => {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const extractTodos = async (rawText: string) => {
    if (!rawText) return;

    setIsProcessing(true);
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
          response_format: { type: "json_object" } 
        })
      });

      const data = await response.json();
      const parsed = JSON.parse(data.choices[0].message.content);
      setTodos(parsed.todos || []);
      return parsed.todos as TodoItem[];
    } catch (err) {
      console.error('OpenAI Error:', err);
      Alert.alert('AI解析エラー', 'TODOの抽出に失敗しました');
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    todos,
    isProcessing,
    extractTodos,
    setTodos // 手動修正用
  };
};