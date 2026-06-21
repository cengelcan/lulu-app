import { CHECK_IN_CATEGORIES } from '@/constants/check-in';
import type { ReportDataSelection, ReportDateRange, ReportPreviewContent } from '@/types/report';
import type { CheckIn, CheckInCategory } from '@/types/check-in';
import type { PetRecord, RecordTypeId } from '@/types/pet-record';
import { getRecordSummary, getRecordTypeLabelKey } from '@/utils/pet-record-display';
import { isDateWithinRange, resolveReportDateRange } from '@/utils/report-range';

type TranslateFn = (key: string, params?: Record<string, string | number>) => string;

type BuildReportPreviewParams = {
  range: ReportDateRange;
  selection: ReportDataSelection;
  checkIns: CheckIn[];
  records: PetRecord[];
  t: TranslateFn;
};

function getCheckInFieldLabel(category: CheckInCategory, t: TranslateFn): string {
  const definition = CHECK_IN_CATEGORIES.find((item) => item.key === category);
  return definition ? t(definition.translationKey) : category;
}

function getCheckInFieldValue(checkIn: CheckIn, category: CheckInCategory, t: TranslateFn): string {
  const definition = CHECK_IN_CATEGORIES.find((item) => item.key === category);
  if (!definition) {
    return String(checkIn[category]);
  }

  return t(`${definition.optionsTranslationKey}.${checkIn[category]}`);
}

export function buildReportPreviewContent({
  range,
  selection,
  checkIns,
  records,
  t,
}: BuildReportPreviewParams): ReportPreviewContent {
  const { startDate, endDate } = resolveReportDateRange(range);

  const filteredCheckIns = checkIns
    .filter((checkIn) => isDateWithinRange(checkIn.date, startDate, endDate))
    .sort((a, b) => b.date.localeCompare(a.date));

  const filteredRecords = records
    .filter((record) => isDateWithinRange(record.date, startDate, endDate))
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));

  const checkInEntries = filteredCheckIns
    .map((checkIn) => {
      const fields = CHECK_IN_CATEGORIES.filter(
        (category) => selection.checkIn[category.key]
      ).map((category) => ({
        label: getCheckInFieldLabel(category.key, t),
        value: getCheckInFieldValue(checkIn, category.key, t),
      }));

      const notes =
        selection.checkIn.notes && checkIn.notes?.trim() ? checkIn.notes.trim() : null;

      if (fields.length === 0 && !notes) {
        return null;
      }

      return {
        date: checkIn.date,
        fields,
        notes,
      };
    })
    .filter((entry) => entry !== null);

  const recordEntries = filteredRecords
    .filter((record) => selection.records[record.type as RecordTypeId])
    .map((record) => ({
      date: record.date,
      typeLabel: t(getRecordTypeLabelKey(record.type)),
      detail: getRecordSummary(record, t),
      notes: record.notes?.trim() ? record.notes.trim() : null,
    }));

  return {
    startDate,
    endDate,
    checkIns: checkInEntries,
    records: recordEntries,
    isEmpty: checkInEntries.length === 0 && recordEntries.length === 0,
  };
}
