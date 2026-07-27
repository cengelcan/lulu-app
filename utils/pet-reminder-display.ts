import type { ReminderTypeLabelKey } from '@/constants/reminder-types';
import { REMINDER_TYPES } from '@/constants/reminder-types';
import type { PetReminder, ReminderTypeId } from '@/types/pet-reminder';

type TranslateFn = (key: string, params?: Record<string, string | number>) => string;

export function getReminderTypeLabelKey(type: ReminderTypeId): ReminderTypeLabelKey {
  const definition = REMINDER_TYPES.find((item) => item.id === type);
  if (!definition) {
    return 'reminders.types.custom';
  }

  return definition.labelKey;
}

export function getReminderTitle(reminder: PetReminder, t: TranslateFn): string {
  switch (reminder.type) {
    case 'vet_visit':
      return (
        reminder.metadata.title?.trim() ||
        reminder.metadata.clinicName?.trim() ||
        t('reminders.summary.vetVisit')
      );
    case 'vaccine':
      return reminder.metadata.vaccineName.trim() || t('reminders.summary.vaccine');
    case 'parasite':
      return reminder.metadata.productName?.trim() || t('reminders.summary.parasite');
    case 'medication':
      return reminder.metadata.medicationName.trim() || t('reminders.summary.medication');
    case 'custom':
      return reminder.metadata.title.trim() || t('reminders.summary.custom');
  }
}

export function getReminderFormRoute(type: ReminderTypeId, id?: string): string {
  if (id) {
    return `/reminders/${type}?id=${encodeURIComponent(id)}`;
  }

  return `/reminders/${type}`;
}
