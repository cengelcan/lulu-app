import type { PetRecord, WeightUnit } from '@/types/pet-record';

export const WEIGHT_CHART_MAX_POINTS = 12;

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

export function normalizeWeightChartValues(
  values: number[],
  minValue: number,
  maxValue: number
): number[] {
  const range = maxValue - minValue;
  const padding = range > 0 ? range * 0.12 : 0.5;
  const paddedMin = minValue - padding;
  const paddedMax = maxValue + padding;
  const paddedRange = paddedMax - paddedMin;

  if (paddedRange <= 0) {
    return values.map(() => 0.5);
  }

  return values.map((value) => (value - paddedMin) / paddedRange);
}
