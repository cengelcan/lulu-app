import type { ReminderTime } from '@/types/reminder';

export function formatReminderTime24h({ hour, minute }: ReminderTime): string {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

export function formatReminderTime({ hour, minute }: ReminderTime): string {
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

export function reminderTimeFromDate(date: Date): ReminderTime {
  return { hour: date.getHours(), minute: date.getMinutes() };
}

export function reminderTimeToDate({ hour, minute }: ReminderTime): Date {
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date;
}

export function isValidReminderTime(time: ReminderTime): boolean {
  return (
    Number.isInteger(time.hour) &&
    Number.isInteger(time.minute) &&
    time.hour >= 0 &&
    time.hour <= 23 &&
    time.minute >= 0 &&
    time.minute <= 59
  );
}
