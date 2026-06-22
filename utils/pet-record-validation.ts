import type {
  PetRecordMetadataByType,
  RecordTypeId,
  SymptomSeverity,
  WeightUnit,
} from '@/types/pet-record';
import { isValidLocalDateString } from '@/utils/date';

export type RecordValidationErrorKey =
  | 'records.validation.dateRequired'
  | 'records.validation.dateInvalid'
  | 'records.validation.vaccineNameRequired'
  | 'records.validation.medicationNameRequired'
  | 'records.validation.symptomNameRequired'
  | 'records.validation.procedureNameRequired'
  | 'records.validation.testNameRequired'
  | 'records.validation.weightValueRequired'
  | 'records.validation.weightValueInvalid'
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
    case 'symptom': {
      const data = metadata as PetRecordMetadataByType['symptom'];
      return data.symptomName.trim() ? null : 'records.validation.symptomNameRequired';
    }
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
    case 'operation': {
      const data = metadata as PetRecordMetadataByType['operation'];
      return data.procedureName.trim() ? null : 'records.validation.procedureNameRequired';
    }
    case 'test_result': {
      const data = metadata as PetRecordMetadataByType['test_result'];
      return data.testName.trim() ? null : 'records.validation.testNameRequired';
    }
  }
}

function isWeightUnit(value: string): value is WeightUnit {
  return value === 'kg' || value === 'lb';
}

export function isSymptomSeverity(value: string): value is SymptomSeverity {
  return value === 'mild' || value === 'moderate' || value === 'severe';
}

export function parseWeightInput(value: string): number {
  const normalized = value.replace(',', '.').trim();
  if (!normalized) {
    return 0;
  }

  return Number.parseFloat(normalized);
}
