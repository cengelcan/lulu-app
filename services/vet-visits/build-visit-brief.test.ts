import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { buildVisitBrief } from '@/services/vet-visits/build-visit-brief';
import type { CheckIn } from '@/types/check-in';
import type { MedicationPlan } from '@/types/medication';
import type { PetRecord } from '@/types/pet-record';
import { DEFAULT_VISIT_BRIEF_SELECTION } from '@/types/vet-visit';

const t = (key: string, params?: Record<string, string | number>) =>
  `${key}:${JSON.stringify(params ?? {})}`;

const range = {
  preset: 'custom' as const,
  startDate: '2026-07-01',
  endDate: '2026-07-30',
};

const checkIn: CheckIn = {
  id: 'check-1',
  petId: 'pet-1',
  date: '2026-07-20',
  appetite: 'less',
  waterIntake: 'normal',
  energy: 'normal',
  mood: 'normal',
  pee: 'normal',
  poop: 'normal',
  createdAt: '2026-07-20T08:00:00.000Z',
};

const weightRecord: PetRecord = {
  id: 'weight-1',
  petId: 'pet-1',
  type: 'weight',
  date: '2026-07-21',
  metadata: { value: 8.4, unit: 'kg' },
  createdAt: '2026-07-21T08:00:00.000Z',
  updatedAt: '2026-07-21T08:00:00.000Z',
};

const medication: MedicationPlan = {
  id: 'plan-1',
  petId: 'pet-1',
  name: 'Medicine',
  dosage: '1',
  unit: 'tablet',
  startsOn: '2026-07-01',
  timezone: 'Europe/Berlin',
  isPrn: false,
  status: 'active',
  createdAt: '2026-07-01T08:00:00.000Z',
  updatedAt: '2026-07-01T08:00:00.000Z',
};

describe('buildVisitBrief', () => {
  it('builds deterministic items with traceable source ids', () => {
    const brief = buildVisitBrief({
      range,
      selection: DEFAULT_VISIT_BRIEF_SELECTION,
      checkIns: [checkIn],
      records: [weightRecord],
      medicationPlans: [medication],
      reason: '  Appetite change  ',
      questions: ['  Could this be related?  '],
      t,
    });

    assert.equal(brief.isEmpty, false);
    assert.equal(brief.reason, 'Appetite change');
    assert.deepEqual(brief.questions, ['Could this be related?']);
    assert.ok(brief.items.some((item) => item.id === 'attention-days'));
    assert.ok(brief.items.some((item) => item.id === 'latest-weight'));
    assert.ok(brief.items.some((item) => item.id === 'active-medications'));
    assert.ok(brief.items.every((item) => item.sourceIds.length > 0));
    assert.deepEqual(
      new Set(brief.sources.map((source) => source.id)),
      new Set(['check-in:check-1', 'record:weight-1', 'medication:plan-1'])
    );
  });

  it('excludes unselected sections and out-of-range data', () => {
    const brief = buildVisitBrief({
      range,
      selection: { checkIns: false, records: true, medications: false },
      checkIns: [checkIn],
      records: [
        weightRecord,
        { ...weightRecord, id: 'old', date: '2026-06-30' },
      ],
      medicationPlans: [medication],
      t,
    });

    assert.deepEqual(
      brief.sources.map((source) => source.id),
      ['record:weight-1']
    );
    assert.equal(brief.items.some((item) => item.id === 'observed-days'), false);
    assert.equal(brief.items.some((item) => item.id === 'active-medications'), false);
  });

  it('reports an honest empty state when no source or question exists', () => {
    const brief = buildVisitBrief({
      range,
      selection: DEFAULT_VISIT_BRIEF_SELECTION,
      checkIns: [],
      records: [],
      medicationPlans: [],
      questions: ['   '],
      t,
    });

    assert.equal(brief.isEmpty, true);
    assert.deepEqual(brief.items, []);
    assert.deepEqual(brief.sources, []);
    assert.equal(brief.reason, '');
  });
});
