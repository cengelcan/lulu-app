import type { RecordTypeLabelKey } from '@/constants/record-types';
import { RECORD_TYPES } from '@/constants/record-types';
import type { PetRecord, RecordTypeId } from '@/types/pet-record';
import { formatCheckInTitleDate } from '@/utils/date';

type TranslateFn = (key: string, params?: Record<string, string | number>) => string;

export function getRecordTypeLabelKey(type: RecordTypeId): RecordTypeLabelKey {
  const definition = RECORD_TYPES.find((item) => item.id === type);
  if (!definition) {
    return 'records.types.other';
  }

  return definition.labelKey;
}

export function formatRecordDate(date: string, locale: string): string {
  return formatCheckInTitleDate(date, locale);
}

export function getRecordSummary(record: PetRecord, t: TranslateFn): string {
  switch (record.type) {
    case 'vet_visit':
      return record.metadata.clinicName?.trim() || record.metadata.reason?.trim() || t('records.summary.vetVisit');
    case 'vaccine':
      return record.metadata.vaccineName.trim() || t('records.summary.vaccine');
    case 'parasite':
      return record.metadata.productName?.trim() || t('records.summary.parasite');
    case 'medication':
      return record.metadata.medicationName.trim() || t('records.summary.medication');
    case 'vomiting':
      return record.metadata.severity
        ? t(`records.severity.${record.metadata.severity}`)
        : t('records.summary.vomiting');
    case 'weight':
      return t('records.summary.weightValue', {
        value: record.metadata.value,
        unit: t(`records.units.${record.metadata.unit}`),
      });
    case 'other':
      return record.metadata.title?.trim() || t('records.summary.other');
  }
}

export function getRecordFormRoute(type: RecordTypeId, id?: string): string {
  if (id) {
    return `/records/${type}?id=${encodeURIComponent(id)}`;
  }

  return `/records/${type}`;
}
