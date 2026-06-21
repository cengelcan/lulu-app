import { CHECK_IN_CATEGORIES } from '@/constants/check-in';
import { RECORD_TYPES } from '@/constants/record-types';
import type {
  ReportCheckInDataKey,
  ReportDataSelection,
  ReportRangePreset,
  ReportRecordDataKey,
} from '@/types/report';

export const REPORT_RANGE_PRESETS: readonly ReportRangePreset[] = [
  '7d',
  '30d',
  '90d',
  'custom',
] as const;

export const REPORT_CHECK_IN_DATA_KEYS: readonly ReportCheckInDataKey[] = [
  ...CHECK_IN_CATEGORIES.map((category) => category.key),
  'notes',
] as const;

export const REPORT_RECORD_DATA_KEYS: readonly ReportRecordDataKey[] = RECORD_TYPES.map(
  (type) => type.id
);

export function createDefaultReportDataSelection(): ReportDataSelection {
  const checkIn = {} as Record<ReportCheckInDataKey, boolean>;
  for (const key of REPORT_CHECK_IN_DATA_KEYS) {
    checkIn[key] = true;
  }

  const records = {} as Record<ReportRecordDataKey, boolean>;
  for (const key of REPORT_RECORD_DATA_KEYS) {
    records[key] = true;
  }

  return { checkIn, records };
}

export function hasAnyReportDataSelection(selection: ReportDataSelection): boolean {
  const hasCheckIn = Object.values(selection.checkIn).some(Boolean);
  const hasRecords = Object.values(selection.records).some(Boolean);
  return hasCheckIn || hasRecords;
}
