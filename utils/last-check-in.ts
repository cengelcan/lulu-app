import type { CheckIn } from '@/types/check-in';
import {
  formatCheckInTitleDate,
  formatLocalDate,
  getTodayStart,
  isTodayLocalDate,
} from '@/utils/date';

export function getLatestCheckIn(checkIns: CheckIn[]): CheckIn | null {
  if (checkIns.length === 0) {
    return null;
  }

  return [...checkIns].sort((a, b) => {
    const dateCompare = b.date.localeCompare(a.date);
    if (dateCompare !== 0) {
      return dateCompare;
    }

    return b.createdAt.localeCompare(a.createdAt);
  })[0];
}

type Translate = (key: string, params?: Record<string, string>) => string;

export function formatLastCheckInWhen(
  checkIn: CheckIn,
  locale: string,
  t: Translate
): string {
  const time = new Date(checkIn.createdAt).toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  if (isTodayLocalDate(checkIn.date)) {
    return t('dashboard.lastCheckInWhenToday', { time });
  }

  const yesterday = new Date(getTodayStart());
  yesterday.setDate(yesterday.getDate() - 1);

  if (checkIn.date === formatLocalDate(yesterday)) {
    return t('dashboard.lastCheckInWhenYesterday', { time });
  }

  const dateLabel = formatCheckInTitleDate(checkIn.date, locale);
  return t('dashboard.lastCheckInWhenDate', { date: dateLabel, time });
}
