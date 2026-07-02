import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { CheckIn } from '@/types/check-in';
import {
  buildDashboardTrends,
  DASHBOARD_TREND_ORDER,
  normalizeTrendChartPoints,
  TREND_CHART_DAYS,
} from '@/utils/trends';

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

function getMetric(trends: ReturnType<typeof buildDashboardTrends>, kind: (typeof DASHBOARD_TREND_ORDER)[number]) {
  return trends.metrics.find((metric) => metric.kind === kind);
}

describe('buildDashboardTrends', () => {
  it('returns all trend metrics with seven-day charts even when there is no data', () => {
    const trends = buildDashboardTrends([], REFERENCE_DATE);

    assert.deepEqual(
      trends.metrics.map((metric) => metric.kind),
      DASHBOARD_TREND_ORDER
    );
    assert.equal(getMetric(trends, 'appetite')?.chartDays.length, TREND_CHART_DAYS);
    assert.equal(getMetric(trends, 'appetite')?.hasData, false);
  });

  it('builds calendar-week check-in charts aligned with daily check-in', () => {
    const checkIns = [
      createCheckIn({ date: '2026-06-20', appetite: 'normal', energy: 'normal' }),
      createCheckIn({ date: '2026-06-22', appetite: 'less', energy: 'low' }),
      createCheckIn({ date: '2026-06-23', appetite: 'more', energy: 'high' }),
    ];

    const trends = buildDashboardTrends(checkIns, REFERENCE_DATE);
    const appetite = getMetric(trends, 'appetite');
    const energy = getMetric(trends, 'energy');

    assert.equal(appetite?.chartDays[0]?.date, '2026-06-22');
    assert.equal(appetite?.chartDays.at(-1)?.date, '2026-06-28');
    assert.equal(appetite?.chartDays[0]?.value, 40);
    assert.equal(appetite?.chartDays[1]?.value, 90);
    assert.equal(appetite?.chartDays[2]?.status, 'no_data');
    assert.equal(energy?.chartDays[1]?.status, 'normal');
    assert.equal(energy?.chartDays[0]?.status, 'attention');
  });

  it('maps poop and pee to daily status rows', () => {
    const checkIns = [
      createCheckIn({
        date: '2026-06-22',
        poop: 'normal',
        pee: 'not_normal',
      }),
      createCheckIn({
        date: '2026-06-23',
        poop: 'not_observed',
        pee: 'normal',
      }),
    ];

    const trends = buildDashboardTrends(checkIns, REFERENCE_DATE);

    assert.equal(getMetric(trends, 'poop')?.displayMode, 'status');
    assert.equal(getMetric(trends, 'pee')?.displayMode, 'status');
    assert.equal(getMetric(trends, 'poop')?.chartDays[0]?.status, 'normal');
    assert.equal(getMetric(trends, 'poop')?.chartDays[1]?.status, 'not_observed');
    assert.equal(getMetric(trends, 'pee')?.chartDays[0]?.status, 'attention');
    assert.equal(getMetric(trends, 'pee')?.chartDays[1]?.status, 'normal');
  });
});

describe('normalizeTrendChartPoints', () => {
  it('returns null slots for missing days and normalizes available values', () => {
    const points = normalizeTrendChartPoints([
      { date: '2026-06-17', value: null, status: 'no_data' },
      { date: '2026-06-18', value: 40, status: 'attention' },
      { date: '2026-06-19', value: null, status: 'no_data' },
      { date: '2026-06-20', value: 100, status: 'normal' },
      { date: '2026-06-21', value: null, status: 'no_data' },
      { date: '2026-06-22', value: 70, status: 'normal' },
      { date: '2026-06-23', value: null, status: 'no_data' },
    ]);

    assert.deepEqual(points, [null, 0, null, 1, null, 0.5, null]);
  });
});
