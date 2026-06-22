import type {
  OtherMetadata,
  PetRecord,
  PetRecordMetadataByType,
  RecordTypeId,
  SymptomMetadata,
  VomitingMetadata,
} from '@/types/pet-record';
import { createDefaultMetadata, isRecordTypeId } from '@/types/pet-record';

const LEGACY_RECORD_TYPE_ALIASES: Record<string, RecordTypeId> = {
  vomiting: 'symptom',
  other: 'symptom',
};

export function resolveRecordTypeId(value: string): RecordTypeId | null {
  if (isRecordTypeId(value)) {
    return value;
  }

  return LEGACY_RECORD_TYPE_ALIASES[value] ?? null;
}

function migrateVomitingMetadata(metadata: VomitingMetadata): SymptomMetadata {
  return {
    symptomName: '',
    severity: metadata.severity ?? null,
  };
}

function migrateOtherMetadata(metadata: OtherMetadata): SymptomMetadata {
  return {
    symptomName: metadata.title?.trim() ?? '',
    severity: null,
  };
}

export function normalizeLegacyRecordMetadata(
  type: string,
  metadata: unknown
): { type: RecordTypeId; metadata: PetRecordMetadataByType[RecordTypeId] } | null {
  if (isRecordTypeId(type)) {
    return {
      type,
      metadata: {
        ...createDefaultMetadata(type),
        ...(metadata as object),
      } as PetRecordMetadataByType[RecordTypeId],
    };
  }

  if (type === 'vomiting') {
    return {
      type: 'symptom',
      metadata: migrateVomitingMetadata({
        severity: (metadata as VomitingMetadata | null)?.severity ?? null,
      }),
    };
  }

  if (type === 'other') {
    return {
      type: 'symptom',
      metadata: migrateOtherMetadata({
        title: (metadata as OtherMetadata | null)?.title ?? null,
      }),
    };
  }

  return null;
}

export function normalizePetRecord(record: PetRecord): PetRecord {
  const normalized = normalizeLegacyRecordMetadata(record.type, record.metadata);

  if (!normalized || normalized.type === record.type) {
    return record;
  }

  return {
    ...record,
    type: normalized.type,
    metadata: normalized.metadata,
  } as PetRecord;
}
