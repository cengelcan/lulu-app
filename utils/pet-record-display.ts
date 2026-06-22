import type { RecordTypeLabelKey } from '@/constants/record-types';
import { RECORD_TYPES } from '@/constants/record-types';
import type { PetRecord, RecordTypeId } from '@/types/pet-record';
import { formatCheckInTitleDate } from '@/utils/date';

type TranslateFn = (key: string, params?: Record<string, string | number>) => string;

export function getRecordTypeLabelKey(type: RecordTypeId): RecordTypeLabelKey {
  const definition = RECORD_TYPES.find((item) => item.id === type);
  if (!definition) {
    return 'records.types.symptom';
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
    case 'symptom': {
      const name = record.metadata.symptomName.trim();
      if (!name) {
        return record.metadata.severity
          ? `${t('records.summary.vomiting')} · ${t(`records.severity.${record.metadata.severity}`)}`
          : t('records.summary.vomiting');
      }

      return record.metadata.severity
        ? `${name} · ${t(`records.severity.${record.metadata.severity}`)}`
        : name;
    }
    case 'weight':
      return t('records.summary.weightValue', {
        value: record.metadata.value,
        unit: t(`records.units.${record.metadata.unit}`),
      });
    case 'operation': {
      const procedure = record.metadata.procedureName.trim();
      const clinic = record.metadata.clinicName?.trim();
      if (procedure && clinic) {
        return `${procedure} · ${clinic}`;
      }
      return procedure || clinic || t('records.summary.operation');
    }
    case 'test_result':
      return record.metadata.testName.trim() || t('records.summary.testResult');
  }
}

export function getRecordFormRoute(type: RecordTypeId, id?: string): string {
  if (id) {
    return `/records/${type}?id=${encodeURIComponent(id)}`;
  }

  return `/records/${type}`;
}
