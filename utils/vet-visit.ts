import type { ReminderTime } from '@/types/reminder';
import type { VetVisitBundle, VetVisitOutcome, VetVisitQuestion } from '@/types/vet-visit';
import { parseLocalDate } from '@/utils/date';

export function createVetVisitId(): string {
  return typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export function combineVetVisitDateTime(date: string, time: ReminderTime): string | null {
  const value = parseLocalDate(date);
  if (!value || time.hour < 0 || time.hour > 23 || time.minute < 0 || time.minute > 59) {
    return null;
  }

  value.setHours(time.hour, time.minute, 0, 0);
  return value.toISOString();
}

export function splitVetVisitDateTime(scheduledAt: string): {
  date: string;
  time: ReminderTime;
} | null {
  const value = new Date(scheduledAt);
  if (Number.isNaN(value.getTime())) return null;

  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return {
    date: `${year}-${month}-${day}`,
    time: { hour: value.getHours(), minute: value.getMinutes() },
  };
}

export function sortVetVisitQuestions(questions: VetVisitQuestion[]): VetVisitQuestion[] {
  return [...questions].sort((a, b) => a.sortOrder - b.sortOrder || a.createdAt.localeCompare(b.createdAt));
}

export function getUpcomingVetVisit(
  bundles: VetVisitBundle[],
  referenceTime = Date.now()
): VetVisitBundle | null {
  const active = bundles
    .filter(({ visit }) => visit.status === 'in_progress')
    .sort((a, b) => (b.visit.startedAt ?? '').localeCompare(a.visit.startedAt ?? ''))[0];
  if (active) return active;

  return [...bundles]
    .filter(({ visit }) =>
      visit.status === 'planned' && new Date(visit.scheduledAt).getTime() >= referenceTime
    )
    .sort((a, b) => a.visit.scheduledAt.localeCompare(b.visit.scheduledAt))[0] ?? null;
}

export function getVetVisitPreparationProgress(bundle: VetVisitBundle): {
  completed: number;
  total: number;
} {
  const checks = [
    Boolean(bundle.visit.scheduledAt),
    Boolean(bundle.visit.reason.trim()),
    bundle.questions.some((question) => question.text.trim().length > 0),
  ];
  return { completed: checks.filter(Boolean).length, total: checks.length };
}

export function startVetVisit(bundle: VetVisitBundle, startedAt: string): VetVisitBundle {
  return {
    ...bundle,
    visit: {
      ...bundle.visit,
      status: 'in_progress',
      startedAt: bundle.visit.startedAt ?? startedAt,
      updatedAt: startedAt,
    },
  };
}

export function completeVetVisit(
  bundle: VetVisitBundle,
  outcome: VetVisitOutcome,
  completedAt: string
): VetVisitBundle {
  return {
    ...bundle,
    visit: {
      ...bundle.visit,
      status: 'completed',
      startedAt: bundle.visit.startedAt ?? completedAt,
      completedAt,
      updatedAt: completedAt,
    },
    outcome,
  };
}

export function linkVetVisitFollowUp(
  bundle: VetVisitBundle,
  kind: 'reminder' | 'medication',
  entityId: string,
  updatedAt: string
): VetVisitBundle {
  if (!bundle.outcome) return bundle;

  return {
    ...bundle,
    visit: { ...bundle.visit, updatedAt },
    outcome: {
      ...bundle.outcome,
      followUpReminderId: kind === 'reminder' ? entityId : bundle.outcome.followUpReminderId,
      medicationPlanId: kind === 'medication' ? entityId : bundle.outcome.medicationPlanId,
      updatedAt,
    },
  };
}
