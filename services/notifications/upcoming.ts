import {
  CHECK_IN_REMINDER_SCHEDULE,
  isNotificationSchedulablePreference,
  isSchedulableCheckInPreference,
  MULTIPLE_TIMES_DAILY_SLOTS,
  type SchedulableCheckInPreference,
} from '@/services/notifications/constants';
import { addDays, formatLocalDate } from '@/services/notifications/date';
import { isReminderSkipped, type SkippedReminder } from '@/services/notifications/skip.storage';
import type { CheckInPreference } from '@/types/check-in';

export type UpcomingReminderDisplay = {
  dateLabel: 'Today' | 'Tomorrow';
  timeLabel: string;
  slot: SchedulableCheckInPreference;
  date: string;
};

function formatTimeLabel(hour: number, minute: number): string {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

function getDateLabel(date: string, now: Date): 'Today' | 'Tomorrow' {
  return date === formatLocalDate(now) ? 'Today' : 'Tomorrow';
}

function isSlotAfterNow(
  slot: SchedulableCheckInPreference,
  day: Date,
  now: Date
): boolean {
  const { hour, minute } = CHECK_IN_REMINDER_SCHEDULE[slot];
  const slotTime = new Date(day);
  slotTime.setHours(hour, minute, 0, 0);

  return now < slotTime;
}

function getUpcomingFromSlot(
  slot: SchedulableCheckInPreference,
  date: string,
  now: Date
): UpcomingReminderDisplay {
  const { hour, minute } = CHECK_IN_REMINDER_SCHEDULE[slot];

  return {
    slot,
    date,
    dateLabel: getDateLabel(date, now),
    timeLabel: formatTimeLabel(hour, minute),
  };
}

export function resolveUpcomingSlot(
  preference: CheckInPreference | null,
  skippedReminders: SkippedReminder[] = [],
  now: Date = new Date()
): { slot: SchedulableCheckInPreference; date: string } | null {
  if (!isNotificationSchedulablePreference(preference)) {
    return null;
  }

  if (preference === 'multiple_times_daily') {
    for (let dayOffset = 0; dayOffset < 2; dayOffset += 1) {
      const day = addDays(now, dayOffset);
      const date = formatLocalDate(day);
      const slots =
        dayOffset === 0
          ? MULTIPLE_TIMES_DAILY_SLOTS.filter((slot) => isSlotAfterNow(slot, day, now))
          : MULTIPLE_TIMES_DAILY_SLOTS;

      for (const slot of slots) {
        if (!isReminderSkipped(slot, date, skippedReminders)) {
          return { slot, date };
        }
      }
    }

    return null;
  }

  if (isSchedulableCheckInPreference(preference)) {
    const today = formatLocalDate(now);
    const { hour, minute } = CHECK_IN_REMINDER_SCHEDULE[preference];
    const slotToday = new Date(now);
    slotToday.setHours(hour, minute, 0, 0);

    if (now < slotToday && !isReminderSkipped(preference, today, skippedReminders)) {
      return { slot: preference, date: today };
    }

    const tomorrow = formatLocalDate(addDays(now, 1));

    return { slot: preference, date: tomorrow };
  }

  return null;
}

export function getUpcomingReminder(
  preference: CheckInPreference | null,
  skippedReminders: SkippedReminder[] = [],
  now: Date = new Date()
): UpcomingReminderDisplay | null {
  const upcoming = resolveUpcomingSlot(preference, skippedReminders, now);

  if (!upcoming) {
    return null;
  }

  return getUpcomingFromSlot(upcoming.slot, upcoming.date, now);
}

export function canSkipNextReminder(
  preference: CheckInPreference | null,
  skippedReminders: SkippedReminder[] = [],
  now: Date = new Date()
): boolean {
  if (!isNotificationSchedulablePreference(preference)) {
    return false;
  }

  const upcoming = resolveUpcomingSlot(preference, skippedReminders, now);

  if (!upcoming) {
    return false;
  }

  if (preference === 'multiple_times_daily') {
    return true;
  }

  return upcoming.date === formatLocalDate(now);
}
