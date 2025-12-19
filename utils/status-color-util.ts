// スタイルで使う色の定数
export const COLORS = {
  danger: '#FF3B30', // 赤
  warning: '#FFCC00', // 黄
  success: '#34C759', // 緑
  selected: '#007AFF', // 選択中
  done: '#AAAAAA',    // 完了済
};

// 残り日数に応じた色を返す関数
export const getStatusColor = (datetimeAt: number | null, isDone: boolean) => {
  if (isDone) return COLORS.done;
  if (!datetimeAt) return COLORS.success;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(datetimeAt);
  target.setHours(0, 0, 0, 0);

  const diffDays = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays <= 3) return COLORS.danger;
  if (diffDays <= 7) return COLORS.warning;
  return COLORS.success;
};