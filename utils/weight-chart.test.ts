import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { PetRecord } from '@/types/pet-record';
import {
  buildWeightChartData,
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
