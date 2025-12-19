export type CalendarEvent = {
  date: string;
  title: string;
  level?: 1 | 2 | 3;
};

export type DateEvent = CalendarEvent[];

export type EventChip = {
  title: string;
  color: string;
};