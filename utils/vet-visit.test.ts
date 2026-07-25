import assert from 'node:assert/strict';
import test from 'node:test';

import type { VetVisitBundle } from '@/types/vet-visit';
import {
  combineVetVisitDateTime,
  getUpcomingVetVisit,
  getVetVisitPreparationProgress,
  splitVetVisitDateTime,
} from '@/utils/vet-visit';

function bundle(id: string, scheduledAt: string, reason = 'Routine exam'): VetVisitBundle {
  return {
    visit: {
      id, petId: 'pet-1', scheduledAt, providerId: null, providerName: null, reason,
      status: 'planned', healthReportStartDate: null, healthReportEndDate: null,
      startedAt: null, completedAt: null, createdAt: scheduledAt, updatedAt: scheduledAt,
    },
    questions: [],
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

test('selects the nearest future planned visit', () => {
  const visits = [
    bundle('later', '2026-08-03T10:00:00.000Z'),
    bundle('next', '2026-08-02T10:00:00.000Z'),
    bundle('past', '2026-07-01T10:00:00.000Z'),
  ];
  assert.equal(getUpcomingVetVisit(visits, Date.parse('2026-07-25T10:00:00.000Z'))?.visit.id, 'next');
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
