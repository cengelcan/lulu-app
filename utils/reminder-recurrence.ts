import type { ReminderRecurrenceFrequency } from '@/types/pet-reminder';
import { addDays } from '@/services/notifications/date';
import { formatLocalDate, parseLocalDate } from '@/utils/date';

export function computeNextDueDate(
  dueDate: string,
  frequency: ReminderRecurrenceFrequency
): string | null {
  if (frequency === 'none') {
    return null;
  }

  const parsed = parseLocalDate(dueDate);
  if (!parsed) {
    return null;
  }

  switch (frequency) {
    case 'daily':
      return formatLocalDate(addDays(parsed, 1));
    case 'weekly':
      return formatLocalDate(addDays(parsed, 7));
    case 'monthly': {
      const next = new Date(parsed);
      next.setMonth(next.getMonth() + 1);
      return formatLocalDate(next);
    }
    case 'yearly': {
      const next = new Date(parsed);
      next.setFullYear(next.getFullYear() + 1);
      return formatLocalDate(next);
    }
    default:
      return null;
  }
}
