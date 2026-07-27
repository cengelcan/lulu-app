import type { ResolvedLanguage } from '@/types/language';

export type DatePartOrder = 'dmy' | 'mdy' | 'ymd';
export type MeasurementSystem = 'metric' | 'us' | 'uk' | null;

export type DeviceRegionalSnapshot = {
  languageTag: string | null;
  regionCode: string | null;
  decimalSeparator: string | null;
  digitGroupingSeparator: string | null;
  measurementSystem: MeasurementSystem;
  uses24HourClock: boolean | null;
  timeZone: string | null;
};

export type RegionalFormatContext = {
  language: ResolvedLanguage;
  languageLocale: string;
  regionCode: string;
  datePartOrder: DatePartOrder;
  dateSeparator: '.' | '/' | '-';
  decimalSeparator: string;
  digitGroupingSeparator: string;
  measurementSystem: MeasurementSystem;
  uses24HourClock: boolean;
  timeZone: string | null;
};

const LANGUAGE_LOCALE: Record<ResolvedLanguage, string> = {
  en: 'en-US',
  de: 'de-DE',
  tr: 'tr-TR',
};

const DEFAULT_REGION: Record<ResolvedLanguage, string> = {
  en: 'US',
  de: 'DE',
  tr: 'TR',
};

const MONTH_FIRST_REGIONS = new Set(['US', 'PH']);
const YEAR_FIRST_REGIONS = new Set(['CN', 'JP', 'KR', 'TW']);
const DOT_DATE_SEPARATOR_REGIONS = new Set([
  'AT',
  'CH',
  'CZ',
  'DE',
  'FI',
  'HU',
  'NO',
  'PL',
  'RO',
  'RU',
  'SK',
  'TR',
]);

function normalizeRegionCode(regionCode: string | null, language: ResolvedLanguage): string {
  const normalized = regionCode?.trim().toUpperCase();
  return normalized && /^[A-Z]{2}$/.test(normalized) ? normalized : DEFAULT_REGION[language];
}

export function resolveDatePartOrder(regionCode: string): DatePartOrder {
  if (MONTH_FIRST_REGIONS.has(regionCode)) {
    return 'mdy';
  }

  if (YEAR_FIRST_REGIONS.has(regionCode)) {
    return 'ymd';
  }

  return 'dmy';
}

export function resolveDateSeparator(
  regionCode: string,
  datePartOrder: DatePartOrder
): '.' | '/' | '-' {
  if (datePartOrder === 'ymd') {
    return '-';
  }

  return DOT_DATE_SEPARATOR_REGIONS.has(regionCode) ? '.' : '/';
}

function infer24HourClock(languageTag: string | null): boolean {
  if (!languageTag) {
    return true;
  }

  try {
    const resolved = new Intl.DateTimeFormat(languageTag, { hour: 'numeric' }).resolvedOptions();
    return resolved.hour12 === false;
  } catch {
    return true;
  }
}

function resolveSeparators(snapshot: DeviceRegionalSnapshot): {
  decimalSeparator: string;
  digitGroupingSeparator: string;
} {
  if (snapshot.decimalSeparator && snapshot.digitGroupingSeparator) {
    return {
      decimalSeparator: snapshot.decimalSeparator,
      digitGroupingSeparator: snapshot.digitGroupingSeparator,
    };
  }

  try {
    const formatted = new Intl.NumberFormat(snapshot.languageTag ?? undefined, {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
      useGrouping: true,
    }).format(1234.5);
    const separators = formatted.match(/[^0-9\u0660-\u0669\u06f0-\u06f9]/g) ?? [];
    const decimalSeparator = separators[separators.length - 1] ?? '.';
    const digitGroupingSeparator = separators.length > 1 ? (separators[0] ?? ',') : ',';

    return {
      decimalSeparator: snapshot.decimalSeparator ?? decimalSeparator,
      digitGroupingSeparator: snapshot.digitGroupingSeparator ?? digitGroupingSeparator,
    };
  } catch {
    return {
      decimalSeparator: snapshot.decimalSeparator ?? '.',
      digitGroupingSeparator: snapshot.digitGroupingSeparator ?? ',',
    };
  }
}

export function resolveRegionalFormatContext(
  language: ResolvedLanguage,
  snapshot: DeviceRegionalSnapshot
): RegionalFormatContext {
  const regionCode = normalizeRegionCode(snapshot.regionCode, language);
  const separators = resolveSeparators(snapshot);

  return {
    language,
    languageLocale: LANGUAGE_LOCALE[language],
    regionCode,
    datePartOrder: resolveDatePartOrder(regionCode),
    dateSeparator: resolveDateSeparator(regionCode, resolveDatePartOrder(regionCode)),
    decimalSeparator: separators.decimalSeparator,
    digitGroupingSeparator: separators.digitGroupingSeparator,
    measurementSystem: snapshot.measurementSystem,
    uses24HourClock:
      snapshot.uses24HourClock ?? infer24HourClock(snapshot.languageTag),
    timeZone: snapshot.timeZone,
  };
}
