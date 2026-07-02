import { REMINDER_TYPES } from '@/constants/reminder-types';
import type { PetReminder } from '@/types/pet-reminder';
import { addDays } from '@/services/notifications/date';
import { formatLocalDate, getTodayStart, parseLocalDate } from '@/utils/date';
import {
  getReminderTitle,
  getReminderTypeLabelKey,
} from '@/utils/pet-reminder-display';
import { formatReminderTime24h } from '@/utils/time';
import { isReminderOverdue } from '@/utils/reminder-overdue';

type TranslateFn = (key: string, params?: Record<string, string | number>) => string;

export function formatReminderDateTimeParts(
  dueDate: string,
  dueTime: PetReminder['dueTime'],
  locale: string,
  todayKey: string,
  tomorrowKey: string,
  t: TranslateFn
): { dateLabel: string; timeLabel: string } {
  const timeLabel = formatReminderTime24h(dueTime);

  if (dueDate === todayKey) {
    return { dateLabel: t('common.today'), timeLabel };
  }

  if (dueDate === tomorrowKey) {
    return { dateLabel: t('common.tomorrow'), timeLabel };
  }

  const parsed = parseLocalDate(dueDate);
  const dateLabel = parsed
    ? parsed.toLocaleDateString(locale, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : dueDate;

  return { dateLabel, timeLabel };
}

export type UpcomingReminderItem = {
  key: string;
  reminderId: string;
  reminderType: PetReminder['type'];
  title: string;
  typeLabel: string;
  dateLabel: string;
  timeLabel: string;
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

function compareRemindersByDueDateTime(left: PetReminder, right: PetReminder): number {
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
}

export function listUpcomingPendingReminders(
  reminders: PetReminder[],
  referenceDate: Date = new Date()
): PetReminder[] {
  return reminders
    .filter(
      (reminder) => reminder.status === 'pending' && !isReminderOverdue(reminder, referenceDate)
    )
    .sort(compareRemindersByDueDateTime);
}

export function listOverduePendingReminders(
  reminders: PetReminder[],
  referenceDate: Date = new Date()
): PetReminder[] {
  return reminders
    .filter((reminder) => reminder.status === 'pending' && isReminderOverdue(reminder, referenceDate))
    .sort(compareRemindersByDueDateTime);
}

export function hasOverdueReminders(
  reminders: PetReminder[],
  referenceDate: Date = new Date()
): boolean {
  return reminders.some(
    (reminder) => reminder.status === 'pending' && isReminderOverdue(reminder, referenceDate)
  );
}

export function listCompletedReminders(reminders: PetReminder[]): PetReminder[] {
  return reminders
    .filter((reminder) => reminder.status === 'completed')
    .sort((left, right) => (right.completedAt ?? '').localeCompare(left.completedAt ?? ''));
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
  const withinDays = options?.withinDays;
  const limit = options?.limit;

  const candidates = listUpcomingPendingReminders(reminders, today).filter((reminder) => {
    if (withinDays === undefined) {
      return true;
    }

    const endKey = formatLocalDate(addDays(today, withinDays));
    return isWithinDateRange(reminder.dueDate, todayKey, endKey);
  });

  const items: UpcomingReminderItem[] = [];

  for (const reminder of candidates) {
    const typeDefinition = getReminderTypeDefinition(reminder.type);

    const { dateLabel, timeLabel } = formatReminderDateTimeParts(
      reminder.dueDate,
      reminder.dueTime,
      locale,
      todayKey,
      tomorrowKey,
      t
    );

    items.push({
      key: reminder.id,
      reminderId: reminder.id,
      reminderType: reminder.type,
      title: getReminderTitle(reminder, t),
      typeLabel: t(getReminderTypeLabelKey(reminder.type)),
      dateLabel,
      timeLabel,
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

export function buildOverdueReminders(
  reminders: PetReminder[],
  locale: string,
  t: TranslateFn,
  options?: {
    limit?: number;
    referenceDate?: Date;
  }
): UpcomingReminderItem[] {
  const referenceDate = options?.referenceDate ?? new Date();
  const today = new Date(referenceDate);
  today.setHours(0, 0, 0, 0);
  const todayKey = formatLocalDate(today);
  const tomorrowKey = formatLocalDate(addDays(today, 1));
  const limit = options?.limit;

  const candidates = listOverduePendingReminders(reminders, referenceDate);
  const items: UpcomingReminderItem[] = [];

  for (const reminder of candidates) {
    const typeDefinition = getReminderTypeDefinition(reminder.type);
    const { dateLabel, timeLabel } = formatReminderDateTimeParts(
      reminder.dueDate,
      reminder.dueTime,
      locale,
      todayKey,
      tomorrowKey,
      t
    );

    items.push({
      key: reminder.id,
      reminderId: reminder.id,
      reminderType: reminder.type,
      title: getReminderTitle(reminder, t),
      typeLabel: t(getReminderTypeLabelKey(reminder.type)),
      dateLabel,
      timeLabel,
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
      !isReminderOverdue(reminder, referenceDate) &&
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
