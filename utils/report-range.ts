import type { ReportDateRange, ReportRangePreset } from '@/types/report';
import { formatLocalDate, getTodayStart, isValidLocalDateString, parseLocalDate } from '@/utils/date';

export function getPresetDateRange(preset: Exclude<ReportRangePreset, 'custom'>, today = getTodayStart()): {
  startDate: string;
  endDate: string;
} {
  const endDate = formatLocalDate(today);
  const start = new Date(today);

  const dayCount = preset === '7d' ? 7 : preset === '30d' ? 30 : 90;
  start.setDate(start.getDate() - (dayCount - 1));

  return {
    startDate: formatLocalDate(start),
    endDate,
  };
}

export function resolveReportDateRange(range: ReportDateRange): { startDate: string; endDate: string } {
  if (range.preset !== 'custom') {
    return getPresetDateRange(range.preset);
  }

  return {
    startDate: range.startDate,
    endDate: range.endDate,
  };
}

export function isReportDateRangeValid(range: ReportDateRange): boolean {
  const resolved = resolveReportDateRange(range);

  if (!isValidLocalDateString(resolved.startDate) || !isValidLocalDateString(resolved.endDate)) {
    return false;
  }

  const start = parseLocalDate(resolved.startDate);
  const end = parseLocalDate(resolved.endDate);

  if (!start || !end) {
    return false;
  }

  if (start.getTime() > end.getTime()) {
    return false;
  }

  const today = getTodayStart();
  return end.getTime() <= today.getTime();
}

export function isDateWithinRange(date: string, startDate: string, endDate: string): boolean {
  return date >= startDate && date <= endDate;
}
