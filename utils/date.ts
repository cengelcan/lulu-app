export function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function isSameLocalDate(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function formatWeekdayShort(date: Date, locale = 'en-US'): string {
  return date.toLocaleDateString(locale, { weekday: 'short' });
}

export function getCurrentWeekDays(referenceDate: Date = new Date()): Date[] {
  const today = new Date(referenceDate);
  today.setHours(0, 0, 0, 0);

  const daysSinceMonday = (today.getDay() + 6) % 7;
  const monday = new Date(today);
  monday.setDate(today.getDate() - daysSinceMonday);

  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + index);
    return day;
  });
}

export function parseLocalDate(dateString: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateString);
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsed = new Date(year, month - 1, day);

  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return null;
  }

  parsed.setHours(0, 0, 0, 0);
  return parsed;
}

export function isValidLocalDateString(dateString: string): boolean {
  return parseLocalDate(dateString) !== null;
}

export function getTodayStart(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

export function isFutureLocalDate(date: Date): boolean {
  return date.getTime() > getTodayStart().getTime();
}

export function isTodayLocalDate(dateString: string): boolean {
  const parsed = parseLocalDate(dateString);
  if (!parsed) {
    return false;
  }

  return isSameLocalDate(parsed, getTodayStart());
}

export function formatCheckInTitleDate(dateString: string, locale?: string): string {
  const parsed = parseLocalDate(dateString);
  if (!parsed) {
    return dateString;
  }

  return parsed.toLocaleDateString(locale, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTimeDdMmYyyyHhMm(dateString: string): string {
  const parsed = new Date(dateString);
  if (Number.isNaN(parsed.getTime())) {
    return dateString;
  }

  const day = String(parsed.getDate()).padStart(2, '0');
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const year = parsed.getFullYear();
  const hours = String(parsed.getHours()).padStart(2, '0');
  const minutes = String(parsed.getMinutes()).padStart(2, '0');

  return `${day}-${month}-${year} ${hours}:${minutes}`;
}
