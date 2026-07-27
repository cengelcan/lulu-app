import type { WeightUnit } from '@/types/pet-record';
import type { RegionalFormatContext } from '@/utils/regional-format';
import { convertWeight, roundWeightForDisplay } from '@/utils/weight-unit';

type DateInput = Date | string | number;

type NormalizedDateInput = {
  date: Date;
  timeZone: string | undefined;
};

function normalizeDateInput(
  value: DateInput,
  context: RegionalFormatContext
): NormalizedDateInput {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const date = new Date(`${value}T12:00:00.000Z`);
    if (Number.isNaN(date.getTime())) {
      throw new RangeError('Invalid date value');
    }

    return { date, timeZone: 'UTC' };
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new RangeError('Invalid date value');
  }

  return { date, timeZone: context.timeZone ?? undefined };
}

function getNumericDateParts(
  value: DateInput,
  context: RegionalFormatContext
): Record<'day' | 'month' | 'year', string> {
  const { date, timeZone } = normalizeDateInput(value, context);

  return {
    day: new Intl.DateTimeFormat(context.languageLocale, {
      day: '2-digit',
      timeZone,
    }).format(date),
    month: new Intl.DateTimeFormat(context.languageLocale, {
      month: '2-digit',
      timeZone,
    }).format(date),
    year: new Intl.DateTimeFormat(context.languageLocale, {
      year: 'numeric',
      timeZone,
    }).format(date),
  };
}

export function formatShortDate(
  value: DateInput,
  context: RegionalFormatContext
): string {
  const parts = getNumericDateParts(value, context);
  const order = context.datePartOrder === 'dmy'
    ? [parts.day, parts.month, parts.year]
    : context.datePartOrder === 'mdy'
      ? [parts.month, parts.day, parts.year]
      : [parts.year, parts.month, parts.day];

  return order.join(context.dateSeparator);
}

type TextMonthStyle = 'long' | 'short';

function getTextDateParts(
  value: DateInput,
  context: RegionalFormatContext,
  monthStyle: TextMonthStyle
): Record<'day' | 'month' | 'weekday' | 'year', string> {
  const { date, timeZone } = normalizeDateInput(value, context);

  return {
    day: new Intl.DateTimeFormat(context.languageLocale, {
      day: 'numeric',
      timeZone,
    }).format(date),
    month: new Intl.DateTimeFormat(context.languageLocale, {
      month: monthStyle,
      timeZone,
    }).format(date),
    weekday: new Intl.DateTimeFormat(context.languageLocale, {
      weekday: 'long',
      timeZone,
    }).format(date),
    year: new Intl.DateTimeFormat(context.languageLocale, {
      year: 'numeric',
      timeZone,
    }).format(date),
  };
}

function joinTextDateParts(
  parts: Record<'day' | 'month' | 'year', string>,
  context: RegionalFormatContext,
  includeYear: boolean
): string {
  if (context.datePartOrder === 'mdy') {
    return includeYear
      ? `${parts.month} ${parts.day}, ${parts.year}`
      : `${parts.month} ${parts.day}`;
  }

  if (context.datePartOrder === 'ymd' && includeYear) {
    return `${parts.year} ${parts.month} ${parts.day}`;
  }

  return includeYear
    ? `${parts.day} ${parts.month} ${parts.year}`
    : `${parts.day} ${parts.month}`;
}

export function formatLongDate(
  value: DateInput,
  context: RegionalFormatContext
): string {
  return joinTextDateParts(getTextDateParts(value, context, 'long'), context, true);
}

export function formatMediumDate(
  value: DateInput,
  context: RegionalFormatContext,
  includeYear = true
): string {
  return joinTextDateParts(getTextDateParts(value, context, 'short'), context, includeYear);
}

export function formatWeekdayDate(
  value: DateInput,
  context: RegionalFormatContext,
  includeYear = false
): string {
  const parts = getTextDateParts(value, context, 'short');
  return `${parts.weekday}, ${joinTextDateParts(parts, context, includeYear)}`;
}

export function formatWeekdayShort(
  value: DateInput,
  context: RegionalFormatContext
): string {
  const { date, timeZone } = normalizeDateInput(value, context);
  return new Intl.DateTimeFormat(context.languageLocale, {
    weekday: 'short',
    timeZone,
  }).format(date);
}

export function formatTime(value: DateInput, context: RegionalFormatContext): string {
  const { date, timeZone } = normalizeDateInput(value, context);
  return new Intl.DateTimeFormat(context.languageLocale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: !context.uses24HourClock,
    timeZone,
  }).format(date);
}

export function formatWallClockTime(
  value: { hour: number; minute: number },
  context: RegionalFormatContext
): string {
  const date = new Date(Date.UTC(2000, 0, 1, value.hour, value.minute));
  return new Intl.DateTimeFormat(context.languageLocale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: !context.uses24HourClock,
    timeZone: 'UTC',
  }).format(date);
}

export function formatDateTime(
  value: DateInput,
  context: RegionalFormatContext
): string {
  return `${formatMediumDate(value, context)} · ${formatTime(value, context)}`;
}

export function formatRegionalNumber(
  value: number,
  context: RegionalFormatContext,
  options: Intl.NumberFormatOptions = {}
): string {
  const formatted = new Intl.NumberFormat('en-US', options).format(value);
  const groupingPlaceholder = '\u0000';

  return formatted
    .split(',').join(groupingPlaceholder)
    .replace('.', context.decimalSeparator)
    .split(groupingPlaceholder).join(context.digitGroupingSeparator);
}

export function formatWeight(
  value: number,
  sourceUnit: WeightUnit,
  displayUnit: WeightUnit,
  context: RegionalFormatContext,
  fractionDigits = 1
): string {
  const converted = convertWeight(value, sourceUnit, displayUnit);
  const rounded = roundWeightForDisplay(converted, fractionDigits);
  const formatted = formatRegionalNumber(rounded, context, {
    minimumFractionDigits: 0,
    maximumFractionDigits: fractionDigits,
  });

  return `${formatted} ${displayUnit}`;
}
