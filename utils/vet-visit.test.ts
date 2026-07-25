import assert from 'node:assert/strict';
import test from 'node:test';

import type { VetVisitBundle } from '@/types/vet-visit';
import {
  combineVetVisitDateTime,
  getUpcomingVetVisit,
  getVetVisitPreparationProgress,
  completeVetVisit,
  linkVetVisitFollowUp,
  startVetVisit,
  splitVetVisitDateTime,
} from '@/utils/vet-visit';

function bundle(id: string, scheduledAt: string, reason = 'Routine exam'): VetVisitBundle {
  return {
    visit: {
      id, petId: 'pet-1', createdByUserId: 'user-1', scheduledAt,
      providerId: null, providerName: null, reason, generalNotes: null,
      status: 'planned', healthReportStartDate: null, healthReportEndDate: null,
      startedAt: null, completedAt: null, createdAt: scheduledAt, updatedAt: scheduledAt,
    },
    questions: [],
    outcome: null,
  };
}

test('combines and splits local appointment date and time', () => {
  const combined = combineVetVisitDateTime('2026-08-02', { hour: 14, minute: 30 });
  assert.ok(combined);
  assert.deepEqual(splitVetVisitDateTime(combined!), {
    date: '2026-08-02',
    time: { hour: 14, minute: 30 },
  });
});

test('moves a visit through in-progress and completed states', () => {
  const planned = bundle('visit', '2026-08-02T10:00:00.000Z');
  const started = startVetVisit(planned, '2026-08-02T10:05:00.000Z');
  assert.equal(started.visit.status, 'in_progress');
  assert.equal(started.visit.startedAt, '2026-08-02T10:05:00.000Z');

  const outcome = {
    visitId: 'visit', userEnteredSummary: 'Routine exam completed', treatmentNotes: null,
    nextVisitAt: null, followUpReminderId: null, medicationPlanId: null,
    createdAt: '2026-08-02T10:30:00.000Z', updatedAt: '2026-08-02T10:30:00.000Z',
  };
  const completed = completeVetVisit(started, outcome, '2026-08-02T10:30:00.000Z');
  assert.equal(completed.visit.status, 'completed');
  assert.equal(completed.outcome?.userEnteredSummary, 'Routine exam completed');
});

test('selects the nearest future planned visit', () => {
  const visits = [
    bundle('later', '2026-08-03T10:00:00.000Z'),
    bundle('next', '2026-08-02T10:00:00.000Z'),
    bundle('past', '2026-07-01T10:00:00.000Z'),
  ];
  assert.equal(getUpcomingVetVisit(visits, Date.parse('2026-07-25T10:00:00.000Z'))?.visit.id, 'next');
});

test('prefers an in-progress visit over a future planned visit', () => {
  const planned = bundle('planned', '2026-08-02T10:00:00.000Z');
  const active = startVetVisit(
    bundle('active', '2026-07-25T10:00:00.000Z'),
    '2026-07-25T10:05:00.000Z'
  );
  assert.equal(
    getUpcomingVetVisit([planned, active], Date.parse('2026-07-25T10:00:00.000Z'))?.visit.id,
    'active'
  );
});

test('preparation progress requires schedule, reason, and a question', () => {
  const visit = bundle('visit', '2026-08-02T10:00:00.000Z', '');
  assert.deepEqual(getVetVisitPreparationProgress(visit), { completed: 1, total: 3 });
  visit.visit.reason = 'Vomiting';
  visit.questions = [{
    id: 'q1', visitId: 'visit', text: 'What should we watch?', answer: null,
    isAnswered: false, sortOrder: 0, createdAt: visit.visit.createdAt, updatedAt: visit.visit.updatedAt,
  }];
  assert.deepEqual(getVetVisitPreparationProgress(visit), { completed: 3, total: 3 });
});

test('links reminder and medication follow-ups without replacing the other action', () => {
  const completed = completeVetVisit(bundle('visit', '2026-08-02T10:00:00.000Z'), {
    visitId: 'visit', userEnteredSummary: 'Follow-up needed', treatmentNotes: null,
    nextVisitAt: null, followUpReminderId: null, medicationPlanId: null,
    createdAt: '2026-08-02T10:30:00.000Z', updatedAt: '2026-08-02T10:30:00.000Z',
  }, '2026-08-02T10:30:00.000Z');
  const withReminder = linkVetVisitFollowUp(
    completed, 'reminder', 'reminder-1', '2026-08-02T10:31:00.000Z'
  );
  const withMedication = linkVetVisitFollowUp(
    withReminder, 'medication', 'plan-1', '2026-08-02T10:32:00.000Z'
  );
  assert.equal(withMedication.outcome?.followUpReminderId, 'reminder-1');
  assert.equal(withMedication.outcome?.medicationPlanId, 'plan-1');
});
