import type { RecordTypeDefinition } from '@/constants/record-types';
import { RECORD_TYPES } from '@/constants/record-types';
import type { PetRecord, RecordTypeId } from '@/types/pet-record';
import { addDays } from '@/services/notifications/date';
import { formatLocalDate, getTodayStart, parseLocalDate } from '@/utils/date';
import { getRecordSummary } from '@/utils/pet-record-display';

type TranslateFn = (key: string, params?: Record<string, string | number>) => string;

export type UpcomingReminderSource = 'record_date' | 'next_due' | 'end_date';

export type UpcomingReminderItem = {
  key: string;
  recordId: string;
  recordType: RecordTypeId;
  title: string;
  subtitle: string;
  dateLabel: string;
  reminderDate: string;
  icon: RecordTypeDefinition['icon'];
  backgroundColor: string;
};

type ReminderCandidate = {
  record: PetRecord;
  reminderDate: string;
  source: UpcomingReminderSource;
};

function isOnOrAfterToday(dateString: string, todayKey: string): boolean {
  return dateString >= todayKey;
}

function formatShortDate(dateString: string, locale: string): string {
  const parsed = parseLocalDate(dateString);
  if (!parsed) {
    return dateString;
  }

  return parsed.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
  });
}

function formatReminderSubtitle(
  dateString: string,
  locale: string,
  todayKey: string,
  tomorrowKey: string,
  t: TranslateFn
): string {
  if (dateString === todayKey) {
    return t('common.today');
  }

  if (dateString === tomorrowKey) {
    return t('common.tomorrow');
  }

  const parsed = parseLocalDate(dateString);
  if (!parsed) {
    return dateString;
  }

  return parsed.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
  });
}

function getRecordTypeDefinition(type: RecordTypeId): RecordTypeDefinition {
  const definition = RECORD_TYPES.find((item) => item.id === type);
  if (!definition) {
    return RECORD_TYPES[0];
  }

  return definition;
}

function collectReminderCandidates(record: PetRecord, todayKey: string): ReminderCandidate[] {
  const candidates: ReminderCandidate[] = [];

  if (isOnOrAfterToday(record.date, todayKey)) {
    candidates.push({ record, reminderDate: record.date, source: 'record_date' });
  }

  if (record.type === 'vaccine') {
    const nextDueDate = record.metadata.nextDueDate?.trim();
    if (nextDueDate && isOnOrAfterToday(nextDueDate, todayKey) && nextDueDate !== record.date) {
      candidates.push({ record, reminderDate: nextDueDate, source: 'next_due' });
    }
  }

  if (record.type === 'medication') {
    const endDate = record.metadata.endDate?.trim();
    if (endDate && isOnOrAfterToday(endDate, todayKey) && endDate !== record.date) {
      candidates.push({ record, reminderDate: endDate, source: 'end_date' });
    }
  }

  return candidates;
}

export function buildUpcomingReminders(
  records: PetRecord[],
  locale: string,
  t: TranslateFn,
  options?: {
    limit?: number;
    referenceDate?: Date;
  }
): UpcomingReminderItem[] {
  const today = options?.referenceDate ? new Date(options.referenceDate) : getTodayStart();
  today.setHours(0, 0, 0, 0);
  const todayKey = formatLocalDate(today);
  const tomorrowKey = formatLocalDate(addDays(today, 1));
  const limit = options?.limit ?? 3;

  const candidates = records
    .flatMap((record) => collectReminderCandidates(record, todayKey))
    .sort((left, right) => {
      const dateCompare = left.reminderDate.localeCompare(right.reminderDate);
      if (dateCompare !== 0) {
        return dateCompare;
      }

      return left.record.createdAt.localeCompare(right.record.createdAt);
    });

  const seen = new Set<string>();

  const items: UpcomingReminderItem[] = [];

  for (const candidate of candidates) {
    const key = `${candidate.record.id}:${candidate.source}:${candidate.reminderDate}`;
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);

    const typeDefinition = getRecordTypeDefinition(candidate.record.type);
    const title = getRecordSummary(candidate.record, t);
    const subtitle = formatReminderSubtitle(
      candidate.reminderDate,
      locale,
      todayKey,
      tomorrowKey,
      t
    );

    items.push({
      key,
      recordId: candidate.record.id,
      recordType: candidate.record.type,
      title,
      subtitle,
      dateLabel: formatShortDate(candidate.reminderDate, locale),
      reminderDate: candidate.reminderDate,
      icon: typeDefinition.icon,
      backgroundColor: typeDefinition.backgroundColor,
    });

    if (items.length >= limit) {
      break;
    }
  }

  return items;
}

export function hasUpcomingReminders(
  records: PetRecord[],
  referenceDate: Date = new Date()
): boolean {
  const today = new Date(referenceDate);
  today.setHours(0, 0, 0, 0);
  const todayKey = formatLocalDate(today);

  return records.some((record) => collectReminderCandidates(record, todayKey).length > 0);
}
