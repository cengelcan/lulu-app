import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { MedicationPlan, MedicationSchedule } from '@/types/medication';
import { generateMedicationDoses, zonedWallTimeToUtc } from '@/utils/medication-schedule';

const plan: MedicationPlan = {
  id: 'plan-1', petId: 'pet-1', name: 'Medicine', dosage: '1', unit: 'tablet',
  startsOn: '2026-07-20', endsOn: null, timezone: 'Europe/Berlin', isPrn: false,
  status: 'active', createdAt: '2026-07-20T00:00:00.000Z', updatedAt: '2026-07-20T00:00:00.000Z',
};

function schedule(overrides: Partial<MedicationSchedule> = {}): MedicationSchedule {
  return {
    id: 'schedule-1', planId: plan.id, frequency: 'daily', interval: 1, weekdays: [],
    times: [{ hour: 8, minute: 0 }], effectiveFrom: plan.startsOn, effectiveTo: null,
    createdAt: plan.createdAt, updatedAt: plan.updatedAt, ...overrides,
  };
}

describe('medication schedule engine', () => {
  it('creates one stable occurrence for each configured local time', () => {
    const doses = generateMedicationDoses({
      plan,
      schedules: [schedule({ times: [{ hour: 8, minute: 0 }, { hour: 20, minute: 30 }] })],
      rangeStart: '2026-07-20', rangeEnd: '2026-07-21', now: plan.createdAt,
    });
    assert.deepEqual(doses.map((dose) => dose.scheduledAt), [
      '2026-07-20T06:00:00.000Z', '2026-07-20T18:30:00.000Z',
      '2026-07-21T06:00:00.000Z', '2026-07-21T18:30:00.000Z',
    ]);
    assert.equal(new Set(doses.map((dose) => dose.id)).size, 4);
  });

  it('supports weekday selection and multi-week intervals', () => {
    const doses = generateMedicationDoses({
      plan,
      schedules: [schedule({ frequency: 'weekly', interval: 2, weekdays: [1, 3] })],
      rangeStart: '2026-07-20', rangeEnd: '2026-08-05', now: plan.createdAt,
    });
    assert.deepEqual(doses.map((dose) => dose.localDate), [
      '2026-07-20', '2026-07-22', '2026-08-03', '2026-08-05',
    ]);
  });

  it('respects plan and schedule effective dates', () => {
    const doses = generateMedicationDoses({
      plan: { ...plan, endsOn: '2026-07-23' },
      schedules: [schedule({ effectiveFrom: '2026-07-21', effectiveTo: '2026-07-22' })],
      rangeStart: '2026-07-19', rangeEnd: '2026-07-25', now: plan.createdAt,
    });
    assert.deepEqual(doses.map((dose) => dose.localDate), ['2026-07-21', '2026-07-22']);
  });

  it('does not pre-generate PRN or inactive treatment doses', () => {
    assert.equal(generateMedicationDoses({
      plan: { ...plan, isPrn: true }, schedules: [schedule()],
      rangeStart: plan.startsOn, rangeEnd: plan.startsOn,
    }).length, 0);
    assert.equal(generateMedicationDoses({
      plan: { ...plan, status: 'archived' }, schedules: [schedule()],
      rangeStart: plan.startsOn, rangeEnd: plan.startsOn,
    }).length, 0);
  });

  it('keeps the intended local time when daylight-saving offset changes', () => {
    assert.equal(zonedWallTimeToUtc('2026-10-24', { hour: 8, minute: 0 }, 'Europe/Berlin'),
      '2026-10-24T06:00:00.000Z');
    assert.equal(zonedWallTimeToUtc('2026-10-26', { hour: 8, minute: 0 }, 'Europe/Berlin'),
      '2026-10-26T07:00:00.000Z');
  });
});
