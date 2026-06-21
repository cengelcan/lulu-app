import type { VomitingSeverity, WeightUnit } from '@/types/pet-record';

export const VOMITING_SEVERITY_OPTIONS: readonly VomitingSeverity[] = [
  'mild',
  'moderate',
  'severe',
] as const;

export const WEIGHT_UNIT_OPTIONS: readonly WeightUnit[] = ['kg', 'lb'] as const;
