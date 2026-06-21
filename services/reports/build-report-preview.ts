import { CHECK_IN_CATEGORIES, CHECK_IN_NORMAL_VALUES } from '@/constants/check-in';
import { RECORD_TYPES } from '@/constants/record-types';
import type {
  ReportDataSelection,
  ReportDateRange,
  ReportPreviewContent,
  ReportRecordDayGroup,
  ReportRecordEntry,
} from '@/types/report';
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
  locale: string;
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

function getCheckInEmoji(category: CheckInCategory): string {
  return CHECK_IN_CATEGORIES.find((item) => item.key === category)?.emoji ?? '•';
}

function formatRecordTime(createdAt: string, locale: string): string {
  return new Date(createdAt).toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function groupRecordsByDate(entries: ReportRecordEntry[]): ReportRecordDayGroup[] {
  const groups = new Map<string, ReportRecordEntry[]>();

  for (const entry of entries) {
    const existing = groups.get(entry.date);
    if (existing) {
      existing.push(entry);
    } else {
      groups.set(entry.date, [entry]);
    }
  }

  return Array.from(groups.entries())
    .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
    .map(([date, groupEntries]) => ({
      date,
      entries: groupEntries.sort((a, b) => a.time.localeCompare(b.time)),
    }));
}

export function buildReportPreviewContent({
  range,
  selection,
  checkIns,
  records,
  t,
  locale,
}: BuildReportPreviewParams): ReportPreviewContent {
  const { startDate, endDate } = resolveReportDateRange(range);

  const filteredCheckIns = checkIns
    .filter((checkIn) => isDateWithinRange(checkIn.date, startDate, endDate))
    .sort((a, b) => b.date.localeCompare(a.date));

  const filteredRecords = records
    .filter((record) => isDateWithinRange(record.date, startDate, endDate))
    .sort((a, b) => a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt));

  const checkInEntries = filteredCheckIns
    .map((checkIn) => {
      const fields = CHECK_IN_CATEGORIES.filter((category) => selection.checkIn[category.key]).map(
        (category) => ({
          key: category.key as CheckInCategory,
          emoji: getCheckInEmoji(category.key),
          label: getCheckInFieldLabel(category.key, t),
          value: getCheckInFieldValue(checkIn, category.key, t),
          isNormal: checkIn[category.key] === CHECK_IN_NORMAL_VALUES[category.key],
        })
      );

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
    .map((record) => {
      const typeDefinition = RECORD_TYPES.find((type) => type.id === record.type);

      return {
        date: record.date,
        time: formatRecordTime(record.createdAt, locale),
        typeId: record.type,
        icon: typeDefinition?.icon ?? 'ellipsis.circle.fill',
        typeLabel: t(getRecordTypeLabelKey(record.type)),
        detail: getRecordSummary(record, t),
        notes: record.notes?.trim() ? record.notes.trim() : null,
      };
    });

  const recordGroups = groupRecordsByDate(recordEntries);

  return {
    startDate,
    endDate,
    checkIns: checkInEntries,
    recordGroups,
    isEmpty: checkInEntries.length === 0 && recordGroups.length === 0,
  };
}
