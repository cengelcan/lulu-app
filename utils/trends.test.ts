import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { CheckIn } from '@/types/check-in';
import type { PetRecord } from '@/types/pet-record';
import { buildDashboardTrends } from '@/utils/trends';

const REFERENCE_DATE = new Date('2026-06-23T12:00:00');

function createCheckIn(overrides: Partial<CheckIn> & Pick<CheckIn, 'date'>): CheckIn {
  return {
    id: overrides.id ?? `check-in-${overrides.date}`,
    petId: overrides.petId ?? 'pet-1',
    date: overrides.date,
    appetite: overrides.appetite ?? 'normal',
    waterIntake: overrides.waterIntake ?? 'normal',
    energy: overrides.energy ?? 'normal',
    mood: overrides.mood ?? 'normal',
    pee: overrides.pee ?? 'normal',
    poop: overrides.poop ?? 'normal',
    notes: overrides.notes ?? null,
    createdAt: overrides.createdAt ?? `${overrides.date}T10:00:00.000Z`,
  };
}

function createWeightRecord(date: string, value: number): PetRecord {
  return {
    id: `weight-${date}`,
    petId: 'pet-1',
    type: 'weight',
    date,
    metadata: { value, unit: 'kg' },
    notes: null,
    createdAt: `${date}T10:00:00.000Z`,
    updatedAt: `${date}T10:00:00.000Z`,
  };
}

describe('buildDashboardTrends', () => {
  it('returns empty trends when there is no data in the window', () => {
    const trends = buildDashboardTrends([], [], REFERENCE_DATE);

    assert.equal(trends.hasAnyData, false);
    assert.equal(trends.weight.hasData, false);
    assert.equal(trends.appetite.hasData, false);
    assert.equal(trends.energy.hasData, false);
  });

  it('calculates appetite and energy averages from recent check-ins', () => {
    const checkIns = [
      createCheckIn({ date: '2026-06-20', appetite: 'normal', energy: 'normal' }),
      createCheckIn({ date: '2026-06-22', appetite: 'less', energy: 'low' }),
    ];

    const trends = buildDashboardTrends(checkIns, [], REFERENCE_DATE);

    assert.equal(trends.hasAnyData, true);
    assert.equal(trends.appetite.valueLabel, '%70');
    assert.equal(trends.appetite.status, 'normal');
    assert.equal(trends.energy.valueLabel, '%65');
    assert.equal(trends.energy.status, 'attention');
    assert.equal(trends.appetite.sparklinePoints.length, 2);
  });

  it('calculates weight delta across multiple records', () => {
    const records = [
      createWeightRecord('2026-06-01', 4.2),
      createWeightRecord('2026-06-20', 4.6),
    ];

    const trends = buildDashboardTrends([], records, REFERENCE_DATE);

    assert.equal(trends.weight.hasData, true);
    assert.equal(trends.weight.valueLabel, '+0.4 kg');
    assert.equal(trends.weight.subtitleMode, 'delta');
    assert.equal(trends.weight.sparklinePoints.length, 2);
  });

  it('shows latest weight when only one record exists', () => {
    const records = [createWeightRecord('2026-06-20', 4.6)];

    const trends = buildDashboardTrends([], records, REFERENCE_DATE);

    assert.equal(trends.weight.valueLabel, '4.6 kg');
    assert.equal(trends.weight.subtitleMode, 'latest');
  });
});
