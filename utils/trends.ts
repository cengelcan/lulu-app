import type { Appetite, CheckIn, Energy } from '@/types/check-in';
import type { PetRecord, WeightMetadata } from '@/types/pet-record';
import { addDays } from '@/services/notifications/date';
import { formatLocalDate } from '@/utils/date';

export const TREND_WINDOW_DAYS = 30;

const APPETITE_SCORES: Record<Appetite, number> = {
  no_appetite: 0,
  reduced: 40,
  normal: 100,
  increased: 90,
};

const ENERGY_SCORES: Record<Energy, number> = {
  very_low: 0,
  low: 30,
  normal: 100,
  high: 85,
  very_high: 75,
};

export type TrendMetricKind = 'weight' | 'appetite' | 'energy';

export type TrendStatus = 'normal' | 'attention' | 'no_data';

export type TrendMetric = {
  kind: TrendMetricKind;
  valueLabel: string | null;
  status: TrendStatus;
  subtitleMode: 'delta' | 'latest' | 'score' | 'none';
  sparklinePoints: number[];
  hasData: boolean;
};

export type DashboardTrends = {
  weight: TrendMetric;
  appetite: TrendMetric;
  energy: TrendMetric;
  hasAnyData: boolean;
};

function isWithinTrendWindow(dateString: string, windowStartKey: string, todayKey: string): boolean {
  return dateString >= windowStartKey && dateString <= todayKey;
}

function normalizeSparklinePoints(values: number[]): number[] {
  if (values.length === 0) {
    return [];
  }

  if (values.length === 1) {
    return [0.5];
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;

  if (range === 0) {
    return values.map(() => 0.5);
  }

  return values.map((value) => (value - min) / range);
}

function getScoreStatus(score: number): TrendStatus {
  if (score >= 70) {
    return 'normal';
  }

  return 'attention';
}

function formatSignedDelta(delta: number, unit: string): string {
  const rounded = Math.round(delta * 10) / 10;
  const prefix = rounded > 0 ? '+' : '';
  return `${prefix}${rounded} ${unit}`;
}

function formatWeightValue(value: number, unit: WeightMetadata['unit']): string {
  const rounded = Math.round(value * 10) / 10;
  return `${rounded} ${unit}`;
}

function buildCheckInSeries(
  checkIns: CheckIn[],
  windowStartKey: string,
  todayKey: string,
  scoreFor: (checkIn: CheckIn) => number
): number[] {
  const byDate = new Map<string, CheckIn>();

  for (const checkIn of checkIns) {
    if (!isWithinTrendWindow(checkIn.date, windowStartKey, todayKey)) {
      continue;
    }

    const existing = byDate.get(checkIn.date);
    if (!existing || existing.createdAt < checkIn.createdAt) {
      byDate.set(checkIn.date, checkIn);
    }
  }

  return [...byDate.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([, checkIn]) => scoreFor(checkIn));
}

function buildScoreMetric(
  kind: 'appetite' | 'energy',
  scores: number[]
): TrendMetric {
  if (scores.length === 0) {
    return {
      kind,
      valueLabel: null,
      status: 'no_data',
      subtitleMode: 'none',
      sparklinePoints: [],
      hasData: false,
    };
  }

  const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  const roundedAverage = Math.round(average);

  return {
    kind,
    valueLabel: `%${roundedAverage}`,
    status: getScoreStatus(roundedAverage),
    subtitleMode: 'score',
    sparklinePoints: normalizeSparklinePoints(scores),
    hasData: true,
  };
}

function buildWeightMetric(
  records: PetRecord[],
  windowStartKey: string,
  todayKey: string
): TrendMetric {
  const weightRecords = records
    .filter(
      (record): record is Extract<PetRecord, { type: 'weight' }> =>
        record.type === 'weight' &&
        record.metadata.value > 0 &&
        isWithinTrendWindow(record.date, windowStartKey, todayKey)
    )
    .sort((left, right) => left.date.localeCompare(right.date));

  if (weightRecords.length === 0) {
    return {
      kind: 'weight',
      valueLabel: null,
      status: 'no_data',
      subtitleMode: 'none',
      sparklinePoints: [],
      hasData: false,
    };
  }

  const latest = weightRecords[weightRecords.length - 1];
  const unit = latest.metadata.unit;
  const values = weightRecords.map((record) => record.metadata.value);

  if (weightRecords.length === 1) {
    return {
      kind: 'weight',
      valueLabel: formatWeightValue(latest.metadata.value, unit),
      status: 'normal',
      subtitleMode: 'latest',
      sparklinePoints: [0.5],
      hasData: true,
    };
  }

  const earliest = weightRecords[0];
  const delta = latest.metadata.value - earliest.metadata.value;

  return {
    kind: 'weight',
    valueLabel: formatSignedDelta(delta, unit),
    status: 'normal',
    subtitleMode: 'delta',
    sparklinePoints: normalizeSparklinePoints(values),
    hasData: true,
  };
}

export function buildDashboardTrends(
  checkIns: CheckIn[],
  records: PetRecord[],
  referenceDate: Date = new Date()
): DashboardTrends {
  const today = new Date(referenceDate);
  today.setHours(0, 0, 0, 0);
  const todayKey = formatLocalDate(today);
  const windowStartKey = formatLocalDate(addDays(today, -(TREND_WINDOW_DAYS - 1)));

  const appetiteScores = buildCheckInSeries(
    checkIns,
    windowStartKey,
    todayKey,
    (checkIn) => APPETITE_SCORES[checkIn.appetite]
  );
  const energyScores = buildCheckInSeries(
    checkIns,
    windowStartKey,
    todayKey,
    (checkIn) => ENERGY_SCORES[checkIn.energy]
  );

  const weight = buildWeightMetric(records, windowStartKey, todayKey);
  const appetite = buildScoreMetric('appetite', appetiteScores);
  const energy = buildScoreMetric('energy', energyScores);

  return {
    weight,
    appetite,
    energy,
    hasAnyData: weight.hasData || appetite.hasData || energy.hasData,
  };
}
