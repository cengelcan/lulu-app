import type { WeightUnit } from '@/types/pet-record';

export const POUNDS_PER_KILOGRAM = 2.2046226218487757;

export function toKilograms(value: number, unit: WeightUnit): number {
  return unit === 'kg' ? value : value / POUNDS_PER_KILOGRAM;
}

export function fromKilograms(value: number, unit: WeightUnit): number {
  return unit === 'kg' ? value : value * POUNDS_PER_KILOGRAM;
}

export function convertWeight(value: number, from: WeightUnit, to: WeightUnit): number {
  if (from === to) {
    return value;
  }

  return fromKilograms(toKilograms(value, from), to);
}

export function roundWeightForDisplay(value: number, fractionDigits = 1): number {
  const factor = 10 ** fractionDigits;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}
