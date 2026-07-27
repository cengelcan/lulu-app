import { translate } from '@/i18n';
import { addDays, formatLocalDate } from '@/services/notifications/date';
import type { ResolvedLanguage } from '@/types/language';
import type { ReminderTime } from '@/types/reminder';
import { formatWallClockTime } from '@/utils/formatters';
import {
  resolveRegionalFormatContext,
  type RegionalFormatContext,
} from '@/utils/regional-format';

export type UpcomingReminderDisplay = {
  dateLabel: string;
  timeLabel: string;
  date: string;
};

const LANGUAGE_TAG: Record<ResolvedLanguage, string> = {
  de: 'de-DE',
  en: 'en-US',
  tr: 'tr-TR',
};

function getDefaultRegionalFormat(language: ResolvedLanguage): RegionalFormatContext {
  return resolveRegionalFormatContext(language, {
    languageTag: LANGUAGE_TAG[language],
    regionCode: null,
    decimalSeparator: null,
    digitGroupingSeparator: null,
    measurementSystem: null,
    uses24HourClock: null,
    timeZone: null,
  });
}

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
  now: Date = new Date(),
  regionalFormat?: RegionalFormatContext
): UpcomingReminderDisplay | null {
  if (!reminderTime) {
    return null;
  }

  const context = regionalFormat ?? getDefaultRegionalFormat(language);

  const today = formatLocalDate(now);
  if (isTimeAfterNow(reminderTime, now, now)) {
    return {
      date: today,
      dateLabel: getDateLabel(today, now, language),
      timeLabel: formatWallClockTime(reminderTime, context),
    };
  }

  const tomorrow = formatLocalDate(addDays(now, 1));

  return {
    date: tomorrow,
    dateLabel: getDateLabel(tomorrow, now, language),
    timeLabel: formatWallClockTime(reminderTime, context),
  };
}
