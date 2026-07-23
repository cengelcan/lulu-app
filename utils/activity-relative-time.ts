type SupportedActivityLocale = 'de' | 'en' | 'tr';
type ActivityTimeUnit = 'day' | 'hour' | 'minute';

function getSupportedLocale(locale: string): SupportedActivityLocale {
  const language = locale.toLowerCase().split(/[-_]/)[0];
  if (language === 'de' || language === 'tr') return language;
  return 'en';
}

function formatMoment(locale: SupportedActivityLocale, isFuture: boolean): string {
  if (locale === 'de') return isFuture ? 'gleich' : 'gerade eben';
  if (locale === 'tr') return isFuture ? 'birazdan' : 'az önce';
  return isFuture ? 'in a moment' : 'just now';
}

function formatUnit(
  value: number,
  unit: ActivityTimeUnit,
  locale: SupportedActivityLocale,
  isFuture: boolean
): string {
  if (locale === 'tr') {
    const labels: Record<ActivityTimeUnit, string> = {
      day: 'gün',
      hour: 'saat',
      minute: 'dakika',
    };
    return `${value} ${labels[unit]} ${isFuture ? 'sonra' : 'önce'}`;
  }

  if (locale === 'de') {
    const labels: Record<ActivityTimeUnit, [string, string]> = {
      day: ['Tag', 'Tagen'],
      hour: ['Stunde', 'Stunden'],
      minute: ['Minute', 'Minuten'],
    };
    const label = labels[unit][value === 1 ? 0 : 1];
    return isFuture ? `in ${value} ${label}` : `vor ${value} ${label}`;
  }

  const label = value === 1 ? unit : `${unit}s`;
  return isFuture ? `in ${value} ${label}` : `${value} ${label} ago`;
}

export function formatActivityRelativeTime(
  occurredAt: string,
  locale: string,
  referenceDate = new Date()
): string {
  const supportedLocale = getSupportedLocale(locale);
  const elapsedSeconds = Math.round(
    (new Date(occurredAt).getTime() - referenceDate.getTime()) / 1000
  );

  if (!Number.isFinite(elapsedSeconds)) {
    return formatMoment(supportedLocale, false);
  }

  const absoluteSeconds = Math.abs(elapsedSeconds);
  const isFuture = elapsedSeconds > 0;

  if (absoluteSeconds < 60) return formatMoment(supportedLocale, isFuture);
  const minutes = Math.round(absoluteSeconds / 60);
  if (minutes < 60) return formatUnit(minutes, 'minute', supportedLocale, isFuture);
  const hours = Math.round(minutes / 60);
  if (hours < 24) return formatUnit(hours, 'hour', supportedLocale, isFuture);
  const days = Math.round(hours / 24);
  return formatUnit(days, 'day', supportedLocale, isFuture);
}
