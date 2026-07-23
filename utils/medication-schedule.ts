import type {
  MedicationDose,
  MedicationPlan,
  MedicationSchedule,
} from '@/types/medication';
import type { ReminderTimeOfDay } from '@/types/pet-reminder';
import { formatLocalDate, parseLocalDate } from '@/utils/date';

type DateParts = { year: number; month: number; day: number; hour: number; minute: number };

function getZonedParts(date: Date, timezone: string): DateParts {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
    hour: Number(values.hour),
    minute: Number(values.minute),
  };
}

function wallClockValue(parts: DateParts): number {
  return Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute);
}

export function zonedWallTimeToUtc(
  dateKey: string,
  time: ReminderTimeOfDay,
  timezone: string
): string | null {
  const date = parseLocalDate(dateKey);
  if (!date || time.hour < 0 || time.hour > 23 || time.minute < 0 || time.minute > 59) {
    return null;
  }

  const desired: DateParts = {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
    hour: time.hour,
    minute: time.minute,
  };
  let candidate = new Date(wallClockValue(desired));

  for (let iteration = 0; iteration < 3; iteration += 1) {
    const actual = getZonedParts(candidate, timezone);
    const difference = wallClockValue(desired) - wallClockValue(actual);
    if (difference === 0) {
      return candidate.toISOString();
    }
    candidate = new Date(candidate.getTime() + difference);
  }

  return null;
}

function isoWeekday(date: Date): number {
  return date.getDay() === 0 ? 7 : date.getDay();
}

function daysBetween(start: Date, current: Date): number {
  const startUtc = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
  const currentUtc = Date.UTC(current.getFullYear(), current.getMonth(), current.getDate());
  return Math.round((currentUtc - startUtc) / 86_400_000);
}

function matchesScheduleDate(schedule: MedicationSchedule, date: Date): boolean {
  const effectiveFrom = parseLocalDate(schedule.effectiveFrom);
  if (!effectiveFrom) {
    return false;
  }

  const elapsedDays = daysBetween(effectiveFrom, date);
  if (elapsedDays < 0) {
    return false;
  }

  const interval = Math.max(1, Math.trunc(schedule.interval));
  if (schedule.frequency === 'daily') {
    return elapsedDays % interval === 0;
  }

  const allowedWeekdays = schedule.weekdays.length > 0
    ? schedule.weekdays
    : [isoWeekday(effectiveFrom)];
  if (!allowedWeekdays.includes(isoWeekday(date))) {
    return false;
  }

  const elapsedWeeks = Math.floor(elapsedDays / 7);
  return elapsedWeeks % interval === 0;
}

export function buildMedicationDoseId(planId: string, scheduledAt: string): string {
  return `${planId}:${scheduledAt}`;
}

export function generateMedicationDoses(input: {
  plan: MedicationPlan;
  schedules: MedicationSchedule[];
  rangeStart: string;
  rangeEnd: string;
  now?: string;
}): MedicationDose[] {
  const { plan, schedules, rangeStart, rangeEnd } = input;
  if (plan.status !== 'active' || plan.isPrn) {
    return [];
  }

  const requestedStart = parseLocalDate(rangeStart);
  const requestedEnd = parseLocalDate(rangeEnd);
  const planStart = parseLocalDate(plan.startsOn);
  const planEnd = plan.endsOn ? parseLocalDate(plan.endsOn) : null;
  if (!requestedStart || !requestedEnd || !planStart || requestedStart > requestedEnd) {
    return [];
  }

  const start = requestedStart > planStart ? requestedStart : planStart;
  const end = planEnd && planEnd < requestedEnd ? planEnd : requestedEnd;
  const createdAt = input.now ?? new Date().toISOString();
  const doses = new Map<string, MedicationDose>();

  for (const schedule of schedules) {
    const scheduleStart = parseLocalDate(schedule.effectiveFrom);
    const scheduleEnd = schedule.effectiveTo ? parseLocalDate(schedule.effectiveTo) : null;
    if (!scheduleStart) {
      continue;
    }

    for (const cursor = new Date(start); cursor <= end; cursor.setDate(cursor.getDate() + 1)) {
      if (cursor < scheduleStart || (scheduleEnd && cursor > scheduleEnd)) {
        continue;
      }
      if (!matchesScheduleDate(schedule, cursor)) {
        continue;
      }

      const localDate = formatLocalDate(cursor);
      for (const localTime of schedule.times) {
        const scheduledAt = zonedWallTimeToUtc(localDate, localTime, plan.timezone);
        if (!scheduledAt) {
          continue;
        }
        const id = buildMedicationDoseId(plan.id, scheduledAt);
        doses.set(id, {
          id,
          planId: plan.id,
          scheduleId: schedule.id,
          petId: plan.petId,
          scheduledAt,
          localDate,
          localTime,
          timezone: plan.timezone,
          status: 'scheduled',
          completedAt: null,
          actorUserId: null,
          note: null,
          snoozedUntil: null,
          createdAt,
          updatedAt: createdAt,
        });
      }
    }
  }

  return [...doses.values()].sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
}
