import type { Appetite, CheckIn, Energy, Mood, Pee, Poop, WaterIntake } from '@/types/check-in';
import { formatLocalDate, getCurrentWeekDays } from '@/utils/date';

export const TREND_CHART_DAYS = 7;

const APPETITE_POSITIONS: Record<Appetite, number> = {
  less: 0,
  normal: 0.5,
  more: 1,
};

const ENERGY_POSITIONS: Record<Energy, number> = {
  low: 0,
  normal: 0.5,
  high: 1,
};

const WATER_INTAKE_POSITIONS: Record<WaterIntake, number> = {
  less: 0,
  normal: 0.5,
  more: 1,
};

const MOOD_POSITIONS: Record<Mood, number> = {
  low: 0,
  normal: 0.5,
  high: 1,
};

export type TrendLineMetricKind = Exclude<TrendMetricKind, 'poop' | 'pee'>;

export const TREND_AXIS_LABEL_KEYS: Record<
  TrendLineMetricKind,
  {
    top: `checkIn.options.${TrendLineMetricKind}.${string}`;
    middle: `checkIn.options.${TrendLineMetricKind}.${string}`;
    bottom: `checkIn.options.${TrendLineMetricKind}.${string}`;
  }
> = {
  appetite: {
    top: 'checkIn.options.appetite.more',
    middle: 'checkIn.options.appetite.normal',
    bottom: 'checkIn.options.appetite.less',
  },
  waterIntake: {
    top: 'checkIn.options.waterIntake.more',
    middle: 'checkIn.options.waterIntake.normal',
    bottom: 'checkIn.options.waterIntake.less',
  },
  energy: {
    top: 'checkIn.options.energy.high',
    middle: 'checkIn.options.energy.normal',
    bottom: 'checkIn.options.energy.low',
  },
  mood: {
    top: 'checkIn.options.mood.high',
    middle: 'checkIn.options.mood.normal',
    bottom: 'checkIn.options.mood.low',
  },
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

function getScoreStatus(position: number): TrendDailyStatus {
  if (position >= 0.5) {
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


export function getTrendChartPositions(chartDays: TrendChartDay[]): (number | null)[] {
  return chartDays.map((day) => day.value);
}

export function buildDashboardTrends(
  checkIns: CheckIn[],
  referenceDate: Date = new Date()
): DashboardTrends {
  const dayKeys = getCurrentWeekDays(referenceDate).map(formatLocalDate);

  const metricsByKind: Record<TrendMetricKind, TrendMetric> = {
    appetite: buildLineMetric(
      'appetite',
      buildCheckInChartDays(checkIns, dayKeys, (checkIn) => APPETITE_POSITIONS[checkIn.appetite])
    ),
    waterIntake: buildLineMetric(
      'waterIntake',
      buildCheckInChartDays(checkIns, dayKeys, (checkIn) => WATER_INTAKE_POSITIONS[checkIn.waterIntake])
    ),
    energy: buildLineMetric(
      'energy',
      buildCheckInChartDays(checkIns, dayKeys, (checkIn) => ENERGY_POSITIONS[checkIn.energy])
    ),
    mood: buildLineMetric(
      'mood',
      buildCheckInChartDays(checkIns, dayKeys, (checkIn) => MOOD_POSITIONS[checkIn.mood])
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
