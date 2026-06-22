import type { RecordTypeId } from '@/types/pet-record';

export const RECORD_TYPE_EMOJIS: Record<RecordTypeId, string> = {
  vet_visit: '🏥',
  vaccine: '💉',
  parasite: '🐛',
  medication: '💊',
  symptom: '⚠️',
  weight: '⚖️',
  operation: '🩺',
  test_result: '📋',
};

export function getRecordTypeEmoji(typeId: RecordTypeId): string {
  return RECORD_TYPE_EMOJIS[typeId] ?? RECORD_TYPE_EMOJIS.symptom;
}
