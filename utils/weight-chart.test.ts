import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { PetRecord } from '@/types/pet-record';
import {
  buildWeightChartData,
  formatWeightDelta,
  getWeightChartAxisTicks,
  getWeightChartChange,
  normalizeWeightChartValues,
  WEIGHT_CHART_MAX_POINTS,
} from '@/utils/weight-chart';

function createWeightRecord(
  date: string,
  value: number,
  createdAt = `${date}T10:00:00.000Z`
): PetRecord {
  return {
    id: `weight-${date}-${createdAt}`,
    petId: 'pet-1',
    type: 'weight',
    date,
    metadata: { value, unit: 'kg' },
    notes: null,
    createdAt,
    updatedAt: createdAt,
  };
}

describe('buildWeightChartData', () => {
  it('returns empty chart data when there are no weight records', () => {
    const data = buildWeightChartData([]);

    assert.equal(data.hasData, false);
    assert.equal(data.points.length, 0);
    assert.equal(data.latest, null);
  });

  it('sorts weight records by date and keeps only the latest entries', () => {
    const records = Array.from({ length: WEIGHT_CHART_MAX_POINTS + 3 }, (_, index) =>
      createWeightRecord(`2026-01-${String(index + 1).padStart(2, '0')}`, 4 + index * 0.1)
    );

    const data = buildWeightChartData(records);

    assert.equal(data.hasData, true);
    assert.equal(data.points.length, WEIGHT_CHART_MAX_POINTS);
    assert.equal(data.points[0]?.date, '2026-01-04');
    assert.equal(data.points.at(-1)?.value, 4 + (WEIGHT_CHART_MAX_POINTS + 2) * 0.1);
    assert.equal(data.unit, 'kg');
  });

  it('uses the latest record on the same day', () => {
    const data = buildWeightChartData([
      createWeightRecord('2026-06-20', 4.2, '2026-06-20T08:00:00.000Z'),
      createWeightRecord('2026-06-20', 4.4, '2026-06-20T18:00:00.000Z'),
      createWeightRecord('2026-06-23', 4.6),
    ]);

    assert.equal(data.points.length, 2);
    assert.equal(data.points[0]?.value, 4.4);
    assert.equal(data.points[1]?.value, 4.6);
    assert.equal(data.minValue, 4.4);
    assert.equal(data.maxValue, 4.6);
  });
});

describe('normalizeWeightChartValues', () => {
  it('adds padding around the min and max values', () => {
    const normalized = normalizeWeightChartValues([4, 5, 6], 4, 6);

    assert.ok(normalized[0]! > 0);
    assert.ok(normalized[2]! < 1);
    assert.equal(normalized[1], 0.5);
  });
});

describe('getWeightChartAxisTicks', () => {
  it('returns padded min, mid, and max values', () => {
    const ticks = getWeightChartAxisTicks(4.4, 4.8);

    assert.ok(ticks.min < 4.4);
    assert.ok(ticks.max > 4.8);
    assert.equal(ticks.mid, (ticks.min + ticks.max) / 2);
  });
});

describe('getWeightChartChange', () => {
  it('returns null when there is only one point', () => {
    const change = getWeightChartChange(
      [{ date: '2026-06-20', value: 4.8, unit: 'kg' }],
      new Date('2026-06-20')
    );

    assert.equal(change, null);
  });

  it('compares the latest point to the baseline within the period', () => {
    const change = getWeightChartChange(
      [
        { date: '2026-05-20', value: 4.6, unit: 'kg' },
        { date: '2026-06-20', value: 4.8, unit: 'kg' },
      ],
      new Date('2026-06-20')
    );

    assert.ok(change);
    assert.ok(Math.abs(change.valueDelta - 0.2) < 0.0001);
    assert.equal(change.baselineDate, '2026-05-20');
  });
});

describe('formatWeightDelta', () => {
  it('formats positive and negative deltas with signs', () => {
    assert.equal(formatWeightDelta(0.2, 'en-US'), '+0.2');
    assert.equal(formatWeightDelta(-0.3, 'en-US'), '-0.3');
    assert.equal(formatWeightDelta(0, 'en-US'), '0');
  });
});
