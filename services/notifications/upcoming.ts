import {
  CHECK_IN_REMINDER_SCHEDULE,
  isSchedulableCheckInPreference,
  MULTIPLE_TIMES_DAILY_SLOTS,
  type SchedulableCheckInPreference,
} from '@/services/notifications/constants';
import type { CheckInPreference } from '@/types/check-in';

export type UpcomingReminderDisplay = {
  dateLabel: 'Today' | 'Tomorrow';
  timeLabel: string;
};

function formatTimeLabel(hour: number, minute: number): string {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

function getSlotDateLabel(hour: number, minute: number, now: Date): 'Today' | 'Tomorrow' {
  const slotToday = new Date(now);
  slotToday.setHours(hour, minute, 0, 0);

  return now < slotToday ? 'Today' : 'Tomorrow';
}

function getUpcomingFromSlot(
  slot: SchedulableCheckInPreference,
  now: Date
): UpcomingReminderDisplay {
  const { hour, minute } = CHECK_IN_REMINDER_SCHEDULE[slot];

  return {
    dateLabel: getSlotDateLabel(hour, minute, now),
    timeLabel: formatTimeLabel(hour, minute),
  };
}

function getNextMultipleTimesDailySlot(now: Date): SchedulableCheckInPreference {
  for (const slot of MULTIPLE_TIMES_DAILY_SLOTS) {
    const { hour, minute } = CHECK_IN_REMINDER_SCHEDULE[slot];
    const slotTime = new Date(now);
    slotTime.setHours(hour, minute, 0, 0);

    if (now < slotTime) {
      return slot;
    }
  }

  return 'morning';
}

export function getUpcomingReminder(
  preference: CheckInPreference | null,
  now: Date = new Date()
): UpcomingReminderDisplay | null {
  if (!preference) {
    return null;
  }

  if (preference === 'multiple_times_daily') {
    return getUpcomingFromSlot(getNextMultipleTimesDailySlot(now), now);
  }

  if (isSchedulableCheckInPreference(preference)) {
    return getUpcomingFromSlot(preference, now);
  }

  return null;
}
