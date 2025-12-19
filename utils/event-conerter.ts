// utils/event-converter.ts (などの名前で保存)
import { Item } from '../db/db-service';
import { CalendarEvent } from '../components/types/calendar-type';

/**
 * Item型をカレンダー表示用のレベル付きイベント型に変換する
 */
export const convertItemToCalendarEvent = (it: Item, today: Date = new Date()): CalendarEvent => {
  let itLevel: 1 | 2 | 3 = 1;
  const currentToday = new Date(today);
  currentToday.setHours(0, 0, 0, 0);

  if (it.datetime_at) {
    const targetDate = new Date(it.datetime_at);
    targetDate.setHours(0, 0, 0, 0);

    // 日付の差分を計算 (ミリ秒 -> 日)
    const diffTime = targetDate.getTime() - currentToday.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 3) {
      itLevel = 3; // 3日以内
    } else if (diffDays <= 7) {
      itLevel = 2; // 7日以内
    } else {
      itLevel = 1; // それ以上
    }
  }

  return {
    // 💡 カレンダーのキーに合わせて 'yyyy-MM-dd' 形式で返す
    date: new Date(it.datetime_at || it.updated_at).toISOString().split('T')[0],
    title: it.title,
    level: itLevel,
  };
};