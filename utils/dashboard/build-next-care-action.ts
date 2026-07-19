import type { CheckIn } from '@/types/check-in';
import type { PetReminder } from '@/types/pet-reminder';
import { isReminderOverdue } from '@/utils/reminder-overdue';

export type NextCareAction =
  | { kind: 'overdue_medication'; reminder: PetReminder; overdueCount: number }
  | { kind: 'overdue_reminder'; reminder: PetReminder; overdueCount: number }
  | { kind: 'check_in' }
  | { kind: 'upcoming_reminder'; reminder: PetReminder }
  | { kind: 'all_complete' };

type NextCareActionInput = {
  todayCheckIn: CheckIn | null;
  reminders: PetReminder[];
  referenceDate?: Date;
};

function compareByDueInstant(left: PetReminder, right: PetReminder): number {
  const dateComparison = left.dueDate.localeCompare(right.dueDate);
  if (dateComparison !== 0) {
    return dateComparison;
  }

  const leftMinutes = left.dueTime.hour * 60 + left.dueTime.minute;
  const rightMinutes = right.dueTime.hour * 60 + right.dueTime.minute;
  if (leftMinutes !== rightMinutes) {
    return leftMinutes - rightMinutes;
  }

  return left.createdAt.localeCompare(right.createdAt);
}

export function buildNextCareAction({
  todayCheckIn,
  reminders,
  referenceDate = new Date(),
}: NextCareActionInput): NextCareAction {
  const pending = reminders.filter((reminder) => reminder.status === 'pending');
  const overdue = pending
    .filter((reminder) => isReminderOverdue(reminder, referenceDate))
    .sort(compareByDueInstant);

  const overdueMedication = overdue.find((reminder) => reminder.type === 'medication');
  if (overdueMedication) {
    return {
      kind: 'overdue_medication',
      reminder: overdueMedication,
      overdueCount: overdue.length,
    };
  }

  const firstOverdue = overdue[0];
  if (firstOverdue) {
    return {
      kind: 'overdue_reminder',
      reminder: firstOverdue,
      overdueCount: overdue.length,
    };
  }

  if (!todayCheckIn) {
    return { kind: 'check_in' };
  }

  const firstUpcoming = pending
    .filter((reminder) => !isReminderOverdue(reminder, referenceDate))
    .sort(compareByDueInstant)[0];

  if (firstUpcoming) {
    return { kind: 'upcoming_reminder', reminder: firstUpcoming };
  }

  return { kind: 'all_complete' };
}
