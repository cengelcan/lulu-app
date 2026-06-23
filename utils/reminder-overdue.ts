import type { PetReminder, ReminderTimeOfDay } from '@/types/pet-reminder';
import { parseLocalDate } from '@/utils/date';

export function getReminderDueInstant(
  dueDate: string,
  dueTime: ReminderTimeOfDay
): Date {
  const date = parseLocalDate(dueDate) ?? new Date();
  date.setHours(dueTime.hour, dueTime.minute, 0, 0);
  return date;
}

export function isReminderOverdue(
  reminder: Pick<PetReminder, 'status' | 'dueDate' | 'dueTime'>,
  referenceDate: Date = new Date()
): boolean {
  if (reminder.status !== 'pending') {
    return false;
  }

  return getReminderDueInstant(reminder.dueDate, reminder.dueTime).getTime() < referenceDate.getTime();
}
