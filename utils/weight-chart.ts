import type { PetRecord, WeightUnit } from '@/types/pet-record';
import { formatLocalDate } from '@/utils/date';

export const WEIGHT_CHART_MAX_POINTS = 12;
export const WEIGHT_CHANGE_PERIOD_DAYS = 30;

export type WeightChartPoint = {
  date: string;
  value: number;
  unit: WeightUnit;
};

export type WeightChartData = {
  points: WeightChartPoint[];
  hasData: boolean;
  latest: WeightChartPoint | null;
  unit: WeightUnit | null;
  minValue: number | null;
  maxValue: number | null;
};

export type WeightChartAxisTicks = {
  min: number;
  mid: number;
  max: number;
};

export type WeightChartChange = {
  valueDelta: number;
  percentDelta: number | null;
  baselineDate: string;
  baselineValue: number;
};

type WeightRecord = Extract<PetRecord, { type: 'weight' }>;

function isWeightRecord(record: PetRecord): record is WeightRecord {
  return record.type === 'weight' && record.metadata.value > 0;
}

function compareWeightRecords(a: WeightRecord, b: WeightRecord): number {
  const dateCompare = a.date.localeCompare(b.date);
  if (dateCompare !== 0) {
    return dateCompare;
  }

  return a.createdAt.localeCompare(b.createdAt);
}

export function buildWeightChartData(
  records: PetRecord[],
  maxPoints: number = WEIGHT_CHART_MAX_POINTS
): WeightChartData {
  const weightRecords = records.filter(isWeightRecord).sort(compareWeightRecords);
  const latestByDate = new Map<string, WeightRecord>();

  for (const record of weightRecords) {
    latestByDate.set(record.date, record);
  }

  const uniqueRecords = Array.from(latestByDate.values()).sort(compareWeightRecords);

  if (uniqueRecords.length === 0) {
    return {
      points: [],
      hasData: false,
      latest: null,
      unit: null,
      minValue: null,
      maxValue: null,
    };
  }

  const sliced = uniqueRecords.slice(-maxPoints);
  const points: WeightChartPoint[] = sliced.map((record) => ({
    date: record.date,
    value: record.metadata.value,
    unit: record.metadata.unit,
  }));
  const latest = points.at(-1) ?? null;
  const values = points.map((point) => point.value);

  return {
    points,
    hasData: true,
    latest,
    unit: latest?.unit ?? null,
    minValue: Math.min(...values),
    maxValue: Math.max(...values),
  };
}

function getPaddedWeightRange(minValue: number, maxValue: number): {
  min: number;
  max: number;
} {
  const range = maxValue - minValue;
  const padding = range > 0 ? range * 0.12 : 0.5;

  return {
    min: minValue - padding,
    max: maxValue + padding,
  };
}

export function getWeightChartAxisTicks(
  minValue: number,
  maxValue: number
): WeightChartAxisTicks {
  const { min, max } = getPaddedWeightRange(minValue, maxValue);

  return {
    min,
    mid: (min + max) / 2,
    max,
  };
}

export function getWeightChartChange(
  points: WeightChartPoint[],
  referenceDate: Date = new Date(),
  periodDays: number = WEIGHT_CHANGE_PERIOD_DAYS
): WeightChartChange | null {
  if (points.length < 2) {
    return null;
  }

  const latest = points.at(-1);
  if (!latest) {
    return null;
  }

  const priorPoints = points.slice(0, -1);
  const today = new Date(referenceDate);
  today.setHours(0, 0, 0, 0);

  const cutoff = new Date(today);
  cutoff.setDate(cutoff.getDate() - periodDays);
  const cutoffKey = formatLocalDate(cutoff);

  const beforeCutoff = priorPoints.filter((point) => point.date <= cutoffKey);
  const baseline = beforeCutoff.at(-1) ?? priorPoints[0];

  if (!baseline || baseline.date === latest.date) {
    return null;
  }

  const valueDelta = latest.value - baseline.value;
  const percentDelta = baseline.value > 0 ? (valueDelta / baseline.value) * 100 : null;

  return {
    valueDelta,
    percentDelta,
    baselineDate: baseline.date,
    baselineValue: baseline.value,
  };
}

export function formatWeightDelta(value: number, locale: string): string {
  const formatted = Math.abs(value).toLocaleString(locale, {
    maximumFractionDigits: 1,
    minimumFractionDigits: Number.isInteger(Math.abs(value)) ? 0 : 1,
  });

  if (value > 0) {
    return `+${formatted}`;
  }

  if (value < 0) {
    return `-${formatted}`;
  }

  return formatted;
}

export function normalizeWeightChartValues(
  values: number[],
  minValue: number,
  maxValue: number
): number[] {
  const { min: paddedMin, max: paddedMax } = getPaddedWeightRange(minValue, maxValue);
  const paddedRange = paddedMax - paddedMin;

  if (paddedRange <= 0) {
    return values.map(() => 0.5);
  }

  return values.map((value) => (value - paddedMin) / paddedRange);
}
