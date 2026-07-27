import type { RecordTypeLabelKey } from '@/constants/record-types';
import { RECORD_TYPES } from '@/constants/record-types';
import type { PetRecord, RecordTypeId, WeightUnit } from '@/types/pet-record';
import { formatRegionalNumber, formatWeekdayDate } from '@/utils/formatters';
import type { RegionalFormatContext } from '@/utils/regional-format';
import { convertWeight, roundWeightForDisplay } from '@/utils/weight-unit';

type TranslateFn = (key: string, params?: Record<string, string | number>) => string;

export function getRecordTypeLabelKey(type: RecordTypeId): RecordTypeLabelKey {
  const definition = RECORD_TYPES.find((item) => item.id === type);
  if (!definition) {
    return 'records.types.symptom';
  }

  return definition.labelKey;
}

export function formatRecordDate(date: string, context: RegionalFormatContext): string {
  return formatWeekdayDate(date, context);
}

export function getRecordSummary(
  record: PetRecord,
  t: TranslateFn,
  displayWeightUnit?: WeightUnit,
  regionalFormat?: RegionalFormatContext
): string {
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
    case 'weight': {
      const unit = displayWeightUnit ?? record.metadata.unit;
      const value = roundWeightForDisplay(
        convertWeight(record.metadata.value, record.metadata.unit, unit)
      );
      return t('records.summary.weightValue', {
        value: regionalFormat
          ? formatRegionalNumber(value, regionalFormat, { maximumFractionDigits: 1 })
          : value,
        unit: t(`records.units.${unit}`),
      });
    }
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
