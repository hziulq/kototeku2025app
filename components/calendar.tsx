import { useMemo, useState } from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import { CalendarEvent } from "./types/calendar-type";

const daysOfWeek = ["日", "月", "火", "水", "木", "金", "土"];

type CalendarViewProps = {
  events?: CalendarEvent[];
  onSelectDate?: (dateKey: string, events: CalendarEvent[]) => void;
};

const levelColors: Record<number, string> = {
  1: "#22c55e",
  2: "#f59e0b",
  3: "#ef4444",
};

function formatKey(date: Date) {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function normalizeDateKey(value: string) {
  return value.split("T")[0];
}

export function CalendarView({ events = [], onSelectDate }: CalendarViewProps) {
  const today = new Date();
  const [cursor, setCursor] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));

  const monthLabel = cursor.toLocaleDateString("ja-JP", { year: "numeric", month: "long" });

  const eventsByDay = useMemo(() => {
    const grouped: Record<string, CalendarEvent[]> = {};
    events.forEach((ev) => {
      const key = normalizeDateKey(ev.date);
      grouped[key] ? grouped[key].push(ev) : (grouped[key] = [ev]);
    });
    Object.values(grouped).forEach((list) => list.sort((a, b) => (a.level ?? 1) - (b.level ?? 1)));
    return grouped;
  }, [events]);

  const grid = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    const firstDayIndex = firstOfMonth.getDay();
    const prevMonthLast = new Date(year, month, 0).getDate();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const slots: { date: Date; inMonth: boolean }[] = [];

    for (let i = firstDayIndex - 1; i >= 0; i -= 1) {
      slots.push({ date: new Date(year, month - 1, prevMonthLast - i), inMonth: false });
    }

    for (let d = 1; d <= daysInMonth; d += 1) {
      slots.push({ date: new Date(year, month, d), inMonth: true });
    }

    while (slots.length < 36) {
      const nextIndex = slots.length - (firstDayIndex + daysInMonth);
      slots.push({ date: new Date(year, month + 1, nextIndex + 1), inMonth: false });
    }

    return slots.slice(0, 36);
  }, [cursor]);

  const changeMonth = (delta: number) => {
    setCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedView style={styles.navRow}>
          <TouchableOpacity onPress={() => changeMonth(-1)}>
            <ThemedText type="title">{"<"}</ThemedText>
          </TouchableOpacity>
          <ThemedText type="title">{monthLabel}</ThemedText>
          <TouchableOpacity onPress={() => changeMonth(1)}>
            <ThemedText type="title">{">"}</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.weekHeader}>
        {daysOfWeek.map((day) => (
          <ThemedText key={day} style={styles.weekdayText}>
            {day}
          </ThemedText>
        ))}
      </ThemedView>

      <ThemedView style={styles.gridWrap}>
        {grid.map(({ date, inMonth }, idx) => {
          const dateKey = formatKey(date);
          const eventList = eventsByDay[dateKey] ?? [];
          const isToday =
            date.getFullYear() === today.getFullYear() &&
            date.getMonth() === today.getMonth() &&
            date.getDate() === today.getDate();

          return (
            <TouchableOpacity
              activeOpacity={0.8}
              key={idx}
              style={[styles.dayCell, !inMonth && styles.outMonthCell, isToday && styles.todayCell]}
              onPress={() => onSelectDate?.(dateKey, eventList)}
            >
              <ThemedText style={styles.dayNumber}>{date.getDate()}</ThemedText>
              <ThemedView style={styles.eventsColumn}>
                {eventList.slice(0, 3).map((ev, i) => (
                  <ThemedView
                    key={`${dateKey}-${i}`}
                    style={[
                      styles.eventChip,
                      { backgroundColor: levelColors[ev.level ?? 1] || "#6366f1" },
                    ]}
                  >
                    <ThemedText style={styles.eventText} numberOfLines={1}>
                      {ev.title}
                    </ThemedText>
                  </ThemedView>
                ))}
                {eventList.length > 3 && (
                  <ThemedText style={styles.moreText}>+{eventList.length - 3}</ThemedText>
                )}
              </ThemedView>
            </TouchableOpacity>
          );
        })}
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    backgroundColor: "transparent",
  },
  header: {
    paddingHorizontal: 6,
    paddingVertical: 10,
    backgroundColor: "transparent",
  },
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "transparent",
  },
  navText: {
    fontSize: 20,
    fontWeight: "700",
  },
  monthText: {
    fontSize: 18,
    fontWeight: "700",
  },
  weekHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4,
    backgroundColor: "transparent",
  },
  weekdayText: {
    width: "14.2857%",
    textAlign: "center",
    fontWeight: "700",
  },
  gridWrap: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    alignContent: "space-between",
    gap: 1,
    backgroundColor: "transparent",
  },
  dayCell: {
    width: "16.4%",
    minWidth: 48,
    height: "16.8%",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 6,
    backgroundColor: "#fff",
    gap: 4,
  },
  outMonthCell: {
    backgroundColor: "#f8fafc",
    borderColor: "#e2e8f0",
  },
  todayCell: {
    borderColor: "#2563eb",
    borderWidth: 2,
  },
  dayNumber: {
    fontWeight: "700",
    textAlign: "right",
    color: "#111827",
  },
  eventsColumn: {
    gap: 4,
  },
  eventChip: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  eventText: {
    color: "#fff",
    fontSize: 12,
  },
  moreText: {
    fontSize: 12,
    color: "#475569",
  },
});