import type { PetReminder } from '@/types/pet-reminder';
import type { PetRecord, RecordTypeId } from '@/types/pet-record';
import { createDefaultMetadata } from '@/types/pet-record';

function createRecordId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * Converts a completed reminder into a health record.
 * Custom reminders become vet_visit records with the title as the visit reason.
 */
export function reminderToRecord(reminder: PetReminder, completedAt: string): PetRecord {
  const base = {
    id: createRecordId(),
    petId: reminder.petId,
    date: reminder.dueDate,
    notes: reminder.notes ?? null,
    createdAt: completedAt,
    updatedAt: completedAt,
  };

  switch (reminder.type) {
    case 'vet_visit':
      return {
        ...base,
        type: 'vet_visit',
        metadata: {
          clinicName: reminder.metadata.clinicName?.trim() || null,
          reason: reminder.metadata.title?.trim() || null,
        },
      };
    case 'vaccine':
      return {
        ...base,
        type: 'vaccine',
        metadata: {
          vaccineName: reminder.metadata.vaccineName.trim(),
          batchNumber: null,
          nextDueDate: null,
        },
      };
    case 'parasite':
      return {
        ...base,
        type: 'parasite',
        metadata: {
          productName: reminder.metadata.productName?.trim() || null,
        },
      };
    case 'medication':
      return {
        ...base,
        type: 'medication',
        metadata: {
          medicationName: reminder.metadata.medicationName.trim(),
          dosage: null,
          frequency: null,
          endDate: null,
        },
      };
    case 'custom':
      return {
        ...base,
        type: 'vet_visit',
        metadata: {
          clinicName: null,
          reason: reminder.metadata.title.trim(),
        },
      };
  }
}

export function reminderTypeToRecordType(type: PetReminder['type']): RecordTypeId {
  if (type === 'custom') {
    return 'vet_visit';
  }

  return type;
}
