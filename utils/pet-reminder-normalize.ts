import type {
  PetReminder,
  ReminderMetadataByType,
  ReminderRecurrence,
  ReminderRecurrenceFrequency,
  ReminderTimeOfDay,
  ReminderTypeId,
} from '@/types/pet-reminder';
import {
  createDefaultReminderMetadata,
  DEFAULT_REMINDER_RECURRENCE,
  isReminderTypeId,
} from '@/types/pet-reminder';
import { DEFAULT_REMINDER_TIME } from '@/types/reminder';

export function resolveReminderTypeId(value: string): ReminderTypeId | null {
  return isReminderTypeId(value) ? value : null;
}

const RECURRENCE_FREQUENCIES: readonly ReminderRecurrenceFrequency[] = [
  'none',
  'daily',
  'weekly',
  'monthly',
  'yearly',
] as const;

function normalizeDueTime(value: unknown): ReminderTimeOfDay {
  if (!value || typeof value !== 'object') {
    return { ...DEFAULT_REMINDER_TIME };
  }

  const candidate = value as { hour?: unknown; minute?: unknown };

  if (
    typeof candidate.hour === 'number' &&
    typeof candidate.minute === 'number' &&
    candidate.hour >= 0 &&
    candidate.hour <= 23 &&
    candidate.minute >= 0 &&
    candidate.minute <= 59
  ) {
    return { hour: candidate.hour, minute: candidate.minute };
  }

  return { ...DEFAULT_REMINDER_TIME };
}

function normalizeRecurrence(value: unknown): ReminderRecurrence {
  if (!value || typeof value !== 'object') {
    return { ...DEFAULT_REMINDER_RECURRENCE };
  }

  const frequency = (value as { frequency?: unknown }).frequency;

  if (
    typeof frequency === 'string' &&
    (RECURRENCE_FREQUENCIES as readonly string[]).includes(frequency)
  ) {
    return { frequency: frequency as ReminderRecurrenceFrequency };
  }

  return { ...DEFAULT_REMINDER_RECURRENCE };
}

export function splitStoredReminderMetadata(
  type: ReminderTypeId,
  raw: unknown
): { metadata: ReminderMetadataByType[ReminderTypeId]; recurrence: ReminderRecurrence } {
  const envelope =
    raw && typeof raw === 'object' ? { ...(raw as Record<string, unknown>) } : {};

  const recurrence = normalizeRecurrence(envelope.recurrence);
  delete envelope.recurrence;

  return {
    recurrence,
    metadata: {
      ...createDefaultReminderMetadata(type),
      ...envelope,
    } as ReminderMetadataByType[ReminderTypeId],
  };
}

export function mergeStoredReminderMetadata(reminder: PetReminder): Record<string, unknown> {
  return {
    ...reminder.metadata,
    recurrence: reminder.recurrence,
  };
}

export function normalizePetReminder(reminder: PetReminder): PetReminder {
  const metadata = {
    ...createDefaultReminderMetadata(reminder.type),
    ...reminder.metadata,
  } as ReminderMetadataByType[ReminderTypeId];

  return {
    ...reminder,
    dueDate: reminder.dueDate.trim(),
    dueTime: normalizeDueTime(reminder.dueTime),
    notes: reminder.notes?.trim() || null,
    recurrence: normalizeRecurrence(reminder.recurrence),
    recordId: reminder.recordId?.trim() || null,
    completedAt: reminder.completedAt ?? null,
    status: reminder.status === 'completed' ? 'completed' : 'pending',
    metadata,
  } as PetReminder;
}
