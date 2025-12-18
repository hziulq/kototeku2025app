import { useMemo, useState } from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";

type EventChip = { title: string; color: string };

const daysOfWeek = ["日", "月", "火", "水", "木", "金", "土"];

function formatKey(date: Date) {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function CalendarView() {
  const today = new Date();
  const [cursor, setCursor] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));

  const monthLabel = cursor.toLocaleDateString("ja-JP", { year: "numeric", month: "long" });

  const events: Record<string, EventChip[]> = {
    "2025-12-05": [{ title: "〆切 A", color: "#2563eb" }],
    "2025-12-10": [{ title: "MTG", color: "#16a34a" }, { title: "レビュー", color: "#dc2626" }],
    "2025-01-18": [{ title: "納品", color: "#d97706" }],
    "2025-01-23": [{ title: "検証", color: "#0ea5e9" }, { title: "資料作成", color: "#7c3aed" }, { title: "リリース", color: "#f43f5e" }],
  };

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

    while (slots.length < 42) {
      const nextIndex = slots.length - (firstDayIndex + daysInMonth);
      slots.push({ date: new Date(year, month + 1, nextIndex + 1), inMonth: false });
    }

    return slots.slice(0, 42);
  }, [cursor]);

  const changeMonth = (delta: number) => {
    setCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedView style={styles.navRow}>
          <TouchableOpacity onPress={() => changeMonth(-1)}>
            <ThemedText style={styles.navText}>{"<"}</ThemedText>
          </TouchableOpacity>
          <ThemedText style={styles.monthText}>{monthLabel}</ThemedText>
          <TouchableOpacity onPress={() => changeMonth(1)}>
            <ThemedText style={styles.navText}>{">"}</ThemedText>
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
          const key = formatKey(date);
          const eventList = events[key] || [];
          const isToday =
            date.getFullYear() === today.getFullYear() &&
            date.getMonth() === today.getMonth() &&
            date.getDate() === today.getDate();

          return (
            <ThemedView
              key={idx}
              style={[styles.dayCell, !inMonth && styles.outMonthCell, isToday && styles.todayCell]}
            >
              <ThemedText style={styles.dayNumber}>{date.getDate()}</ThemedText>
              <ThemedView style={styles.eventsColumn}>
                {eventList.slice(0, 3).map((ev, i) => (
                  <ThemedView key={i} style={[styles.eventChip, { backgroundColor: ev.color }]}> 
                    <ThemedText style={styles.eventText}>{ev.title}</ThemedText>
                  </ThemedView>
                ))}
                {eventList.length > 3 && (
                  <ThemedText style={styles.moreText}>+{eventList.length - 3}</ThemedText>
                )}
              </ThemedView>
            </ThemedView>
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
    backgroundColor: '#fa8072'
  },
  header: {
    paddingHorizontal: 4,
    paddingVertical: 8,
    backgroundColor: '#fa8072'
  },
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: '#fa8072'
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
    backgroundColor: '#fa8072'
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
    gap: 10,
    backgroundColor: '#fa8072'
  },
  dayCell: {
    width: "14.2857%",
    minWidth: 48,
    height: "16%",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    padding: 6,
    backgroundColor: "#fff",
    gap: 6,
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