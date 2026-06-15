import { translate } from '@/i18n';
import { addDays, formatLocalDate } from '@/services/notifications/date';
import type { ResolvedLanguage } from '@/types/language';
import type { ReminderTime } from '@/types/reminder';
import { formatReminderTime } from '@/utils/time';

export type UpcomingReminderDisplay = {
  dateLabel: string;
  timeLabel: string;
  date: string;
};

function getDateLabel(date: string, now: Date, language: ResolvedLanguage): string {
  const key = date === formatLocalDate(now) ? 'common.today' : 'common.tomorrow';
  return translate(language, key);
}

function isTimeAfterNow(reminderTime: ReminderTime, day: Date, now: Date): boolean {
  const slotTime = new Date(day);
  slotTime.setHours(reminderTime.hour, reminderTime.minute, 0, 0);
  return now < slotTime;
}

export function getUpcomingReminder(
  reminderTime: ReminderTime | null,
  language: ResolvedLanguage = 'en',
  now: Date = new Date()
): UpcomingReminderDisplay | null {
  if (!reminderTime) {
    return null;
  }

  const today = formatLocalDate(now);
  if (isTimeAfterNow(reminderTime, now, now)) {
    return {
      date: today,
      dateLabel: getDateLabel(today, now, language),
      timeLabel: formatReminderTime(reminderTime),
    };
  }

  const tomorrow = formatLocalDate(addDays(now, 1));

  return {
    date: tomorrow,
    dateLabel: getDateLabel(tomorrow, now, language),
    timeLabel: formatReminderTime(reminderTime),
  };
}
