import type {
  PetRecordMetadataByType,
  RecordTypeId,
  VomitingSeverity,
  WeightUnit,
} from '@/types/pet-record';
import { isValidLocalDateString } from '@/utils/date';

export type RecordValidationErrorKey =
  | 'records.validation.dateRequired'
  | 'records.validation.dateInvalid'
  | 'records.validation.vaccineNameRequired'
  | 'records.validation.medicationNameRequired'
  | 'records.validation.weightValueRequired'
  | 'records.validation.weightValueInvalid'
  | 'records.validation.titleRequired'
  | 'records.validation.notesTooLong';

export function validatePetRecordForm(
  type: RecordTypeId,
  date: string,
  metadata: PetRecordMetadataByType[RecordTypeId],
  notesLength: number,
  maxNotesLength: number
): RecordValidationErrorKey | null {
  if (!date.trim()) {
    return 'records.validation.dateRequired';
  }

  if (!isValidLocalDateString(date)) {
    return 'records.validation.dateInvalid';
  }

  if (notesLength > maxNotesLength) {
    return 'records.validation.notesTooLong';
  }

  switch (type) {
    case 'vet_visit':
      return null;
    case 'vaccine': {
      const data = metadata as PetRecordMetadataByType['vaccine'];
      return data.vaccineName.trim() ? null : 'records.validation.vaccineNameRequired';
    }
    case 'parasite':
      return null;
    case 'medication': {
      const data = metadata as PetRecordMetadataByType['medication'];
      return data.medicationName.trim() ? null : 'records.validation.medicationNameRequired';
    }
    case 'vomiting':
      return null;
    case 'weight': {
      const data = metadata as PetRecordMetadataByType['weight'];
      if (!Number.isFinite(data.value) || data.value <= 0) {
        return 'records.validation.weightValueRequired';
      }
      if (!isWeightUnit(data.unit)) {
        return 'records.validation.weightValueInvalid';
      }
      return null;
    }
    case 'other': {
      const data = metadata as PetRecordMetadataByType['other'];
      return data.title?.trim() ? null : 'records.validation.titleRequired';
    }
  }
}

function isWeightUnit(value: string): value is WeightUnit {
  return value === 'kg' || value === 'lb';
}

export function isVomitingSeverity(value: string): value is VomitingSeverity {
  return value === 'mild' || value === 'moderate' || value === 'severe';
}

export function parseWeightInput(value: string): number {
  const normalized = value.replace(',', '.').trim();
  if (!normalized) {
    return 0;
  }

  return Number.parseFloat(normalized);
}
