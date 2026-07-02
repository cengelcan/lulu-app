import type { Appetite, CheckIn, Energy, Mood, Pee, Poop, WaterIntake } from '@/types/check-in';
import { addDays } from '@/services/notifications/date';
import { formatLocalDate } from '@/utils/date';

export const TREND_CHART_DAYS = 7;

const APPETITE_SCORES: Record<Appetite, number> = {
  less: 40,
  normal: 100,
  more: 90,
};

const ENERGY_SCORES: Record<Energy, number> = {
  low: 30,
  normal: 100,
  high: 85,
};

const WATER_INTAKE_SCORES: Record<WaterIntake, number> = {
  less: 40,
  normal: 100,
  more: 90,
};

const MOOD_SCORES: Record<Mood, number> = {
  low: 30,
  normal: 100,
  high: 85,
};

export type CheckInTrendKind = 'appetite' | 'waterIntake' | 'energy' | 'mood' | 'poop' | 'pee';

export type TrendMetricKind = CheckInTrendKind;

export const DASHBOARD_TREND_ORDER: TrendMetricKind[] = [
  'appetite',
  'waterIntake',
  'energy',
  'mood',
  'poop',
  'pee',
];

export type TrendDailyStatus = 'normal' | 'attention' | 'not_observed' | 'no_data';

export type TrendMetricDisplayMode = 'line' | 'status';

export type TrendChartDay = {
  date: string;
  value: number | null;
  status: TrendDailyStatus;
};

export type TrendMetric = {
  kind: TrendMetricKind;
  displayMode: TrendMetricDisplayMode;
  chartDays: TrendChartDay[];
  hasData: boolean;
};

export type DashboardTrends = {
  metrics: TrendMetric[];
};

function buildRollingDayKeys(referenceDate: Date, count: number): string[] {
  const today = new Date(referenceDate);
  today.setHours(0, 0, 0, 0);

  return Array.from({ length: count }, (_, index) =>
    formatLocalDate(addDays(today, -(count - 1 - index)))
  );
}

function getScoreStatus(score: number): TrendDailyStatus {
  if (score >= 70) {
    return 'normal';
  }

  return 'attention';
}

function mapEliminationStatus(value: Poop | Pee): TrendDailyStatus {
  switch (value) {
    case 'normal':
      return 'normal';
    case 'not_normal':
      return 'attention';
    case 'not_observed':
      return 'not_observed';
  }
}

function buildCheckInByDate(checkIns: CheckIn[]): Map<string, CheckIn> {
  const byDate = new Map<string, CheckIn>();

  for (const checkIn of checkIns) {
    const existing = byDate.get(checkIn.date);
    if (!existing || existing.createdAt < checkIn.createdAt) {
      byDate.set(checkIn.date, checkIn);
    }
  }

  return byDate;
}

function buildCheckInChartDays(
  checkIns: CheckIn[],
  dayKeys: string[],
  scoreFor: (checkIn: CheckIn) => number,
  statusFor?: (checkIn: CheckIn) => TrendDailyStatus
): TrendChartDay[] {
  const byDate = buildCheckInByDate(checkIns);

  return dayKeys.map((date) => {
    const checkIn = byDate.get(date);
    if (!checkIn) {
      return { date, value: null, status: 'no_data' };
    }

    const value = scoreFor(checkIn);
    const status = statusFor ? statusFor(checkIn) : getScoreStatus(value);

    return { date, value, status };
  });
}

function buildLineMetric(
  kind: Exclude<TrendMetricKind, 'poop' | 'pee'>,
  chartDays: TrendChartDay[]
): TrendMetric {
  return {
    kind,
    displayMode: 'line',
    chartDays,
    hasData: chartDays.some((day) => day.value !== null),
  };
}

function buildStatusMetric(kind: 'poop' | 'pee', chartDays: TrendChartDay[]): TrendMetric {
  return {
    kind,
    displayMode: 'status',
    chartDays,
    hasData: chartDays.some((day) => day.status !== 'no_data'),
  };
}


export function normalizeTrendChartPoints(chartDays: TrendChartDay[]): (number | null)[] {
  const values = chartDays
    .map((day) => day.value)
    .filter((value): value is number => value !== null);

  if (values.length === 0) {
    return chartDays.map(() => null);
  }

  if (values.length === 1) {
    return chartDays.map((day) => (day.value === null ? null : 0.5));
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;

  if (range === 0) {
    return chartDays.map((day) => (day.value === null ? null : 0.5));
  }

  return chartDays.map((day) =>
    day.value === null ? null : (day.value - min) / range
  );
}

export function buildDashboardTrends(
  checkIns: CheckIn[],
  referenceDate: Date = new Date()
): DashboardTrends {
  const dayKeys = buildRollingDayKeys(referenceDate, TREND_CHART_DAYS);

  const metricsByKind: Record<TrendMetricKind, TrendMetric> = {
    appetite: buildLineMetric(
      'appetite',
      buildCheckInChartDays(checkIns, dayKeys, (checkIn) => APPETITE_SCORES[checkIn.appetite])
    ),
    waterIntake: buildLineMetric(
      'waterIntake',
      buildCheckInChartDays(checkIns, dayKeys, (checkIn) => WATER_INTAKE_SCORES[checkIn.waterIntake])
    ),
    energy: buildLineMetric(
      'energy',
      buildCheckInChartDays(checkIns, dayKeys, (checkIn) => ENERGY_SCORES[checkIn.energy])
    ),
    mood: buildLineMetric(
      'mood',
      buildCheckInChartDays(checkIns, dayKeys, (checkIn) => MOOD_SCORES[checkIn.mood])
    ),
    poop: buildStatusMetric(
      'poop',
      buildCheckInChartDays(
        checkIns,
        dayKeys,
        (checkIn) => (checkIn.poop === 'normal' ? 100 : checkIn.poop === 'not_observed' ? 70 : 25),
        (checkIn) => mapEliminationStatus(checkIn.poop)
      )
    ),
    pee: buildStatusMetric(
      'pee',
      buildCheckInChartDays(
        checkIns,
        dayKeys,
        (checkIn) => (checkIn.pee === 'normal' ? 100 : checkIn.pee === 'not_observed' ? 70 : 25),
        (checkIn) => mapEliminationStatus(checkIn.pee)
      )
    ),
  };

  return {
    metrics: DASHBOARD_TREND_ORDER.map((kind) => metricsByKind[kind]),
  };
}
