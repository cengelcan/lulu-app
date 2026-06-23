import { REMINDER_TYPES } from '@/constants/reminder-types';
import type { PetReminder } from '@/types/pet-reminder';
import { addDays } from '@/services/notifications/date';
import { formatLocalDate, getTodayStart, parseLocalDate } from '@/utils/date';
import {
  formatReminderDateTime,
  getReminderTitle,
  getReminderTypeLabelKey,
} from '@/utils/pet-reminder-display';

type TranslateFn = (key: string, params?: Record<string, string | number>) => string;

export type UpcomingReminderItem = {
  key: string;
  reminderId: string;
  reminderType: PetReminder['type'];
  title: string;
  typeLabel: string;
  dateLabel: string;
  dueDate: string;
  icon: (typeof REMINDER_TYPES)[number]['icon'];
  backgroundColor: string;
};

function getReminderTypeDefinition(type: PetReminder['type']) {
  const definition = REMINDER_TYPES.find((item) => item.id === type);
  if (!definition) {
    return REMINDER_TYPES[REMINDER_TYPES.length - 1];
  }

  return definition;
}

function isWithinDateRange(
  dueDate: string,
  startKey: string,
  endKey: string
): boolean {
  return dueDate >= startKey && dueDate <= endKey;
}

export function buildUpcomingReminders(
  reminders: PetReminder[],
  locale: string,
  t: TranslateFn,
  options?: {
    limit?: number;
    referenceDate?: Date;
    withinDays?: number;
  }
): UpcomingReminderItem[] {
  const today = options?.referenceDate ? new Date(options.referenceDate) : getTodayStart();
  today.setHours(0, 0, 0, 0);
  const todayKey = formatLocalDate(today);
  const tomorrowKey = formatLocalDate(addDays(today, 1));
  const withinDays = options?.withinDays ?? 7;
  const endKey = formatLocalDate(addDays(today, withinDays));
  const limit = options?.limit;

  const candidates = reminders
    .filter((reminder) => reminder.status === 'pending')
    .filter((reminder) => isWithinDateRange(reminder.dueDate, todayKey, endKey))
    .sort((left, right) => {
      const dateCompare = left.dueDate.localeCompare(right.dueDate);
      if (dateCompare !== 0) {
        return dateCompare;
      }

      const leftMinutes = left.dueTime.hour * 60 + left.dueTime.minute;
      const rightMinutes = right.dueTime.hour * 60 + right.dueTime.minute;
      if (leftMinutes !== rightMinutes) {
        return leftMinutes - rightMinutes;
      }

      return left.createdAt.localeCompare(right.createdAt);
    });

  const items: UpcomingReminderItem[] = [];

  for (const reminder of candidates) {
    const typeDefinition = getReminderTypeDefinition(reminder.type);

    items.push({
      key: reminder.id,
      reminderId: reminder.id,
      reminderType: reminder.type,
      title: getReminderTitle(reminder, t),
      typeLabel: t(getReminderTypeLabelKey(reminder.type)),
      dateLabel: formatReminderDateTime(
        reminder.dueDate,
        reminder.dueTime,
        locale,
        todayKey,
        tomorrowKey,
        t
      ),
      dueDate: reminder.dueDate,
      icon: typeDefinition.icon,
      backgroundColor: typeDefinition.backgroundColor,
    });

    if (limit !== undefined && items.length >= limit) {
      break;
    }
  }

  return items;
}

export function hasUpcomingReminders(
  reminders: PetReminder[],
  referenceDate: Date = new Date(),
  withinDays = 7
): boolean {
  const today = new Date(referenceDate);
  today.setHours(0, 0, 0, 0);
  const todayKey = formatLocalDate(today);
  const endKey = formatLocalDate(addDays(today, withinDays));

  return reminders.some(
    (reminder) =>
      reminder.status === 'pending' &&
      isWithinDateRange(reminder.dueDate, todayKey, endKey)
  );
}

export function formatCompletedReminderDate(dateString: string, locale: string): string {
  const parsed = parseLocalDate(dateString);
  if (!parsed) {
    return dateString;
  }

  return parsed.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
