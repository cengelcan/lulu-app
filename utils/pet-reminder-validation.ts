import type { ReminderMetadataByType, ReminderTypeId } from '@/types/pet-reminder';
import { isValidLocalDateString } from '@/utils/date';

export type ReminderValidationErrorKey =
  | 'reminders.validation.dueDateRequired'
  | 'reminders.validation.dueDateInvalid'
  | 'reminders.validation.titleRequired'
  | 'reminders.validation.vaccineNameRequired'
  | 'reminders.validation.medicationNameRequired'
  | 'reminders.validation.notesTooLong';

export function validatePetReminderForm(
  type: ReminderTypeId,
  dueDate: string,
  metadata: ReminderMetadataByType[ReminderTypeId],
  notesLength: number,
  maxNotesLength: number
): ReminderValidationErrorKey | null {
  if (!dueDate.trim()) {
    return 'reminders.validation.dueDateRequired';
  }

  if (!isValidLocalDateString(dueDate)) {
    return 'reminders.validation.dueDateInvalid';
  }

  if (notesLength > maxNotesLength) {
    return 'reminders.validation.notesTooLong';
  }

  switch (type) {
    case 'vet_visit': {
      const data = metadata as ReminderMetadataByType['vet_visit'];
      if (!data.title?.trim() && !data.clinicName?.trim()) {
        return 'reminders.validation.titleRequired';
      }
      return null;
    }
    case 'vaccine': {
      const data = metadata as ReminderMetadataByType['vaccine'];
      if (!data.vaccineName.trim()) {
        return 'reminders.validation.vaccineNameRequired';
      }
      return null;
    }
    case 'parasite': {
      const data = metadata as ReminderMetadataByType['parasite'];
      if (!data.productName?.trim()) {
        return 'reminders.validation.titleRequired';
      }
      return null;
    }
    case 'medication': {
      const data = metadata as ReminderMetadataByType['medication'];
      if (!data.medicationName.trim()) {
        return 'reminders.validation.medicationNameRequired';
      }
      return null;
    }
    case 'custom': {
      const data = metadata as ReminderMetadataByType['custom'];
      if (!data.title.trim()) {
        return 'reminders.validation.titleRequired';
      }
      return null;
    }
  }
}
