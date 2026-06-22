import type { SymptomSeverity, WeightUnit } from '@/types/pet-record';

export const SYMPTOM_SEVERITY_OPTIONS: readonly SymptomSeverity[] = [
  'mild',
  'moderate',
  'severe',
] as const;

export const WEIGHT_UNIT_OPTIONS: readonly WeightUnit[] = ['kg', 'lb'] as const;

export const SYMPTOM_SUGGESTION_KEYS = [
  'records.symptomSuggestions.vomiting',
  'records.symptomSuggestions.lethargy',
  'records.symptomSuggestions.lossOfAppetite',
  'records.symptomSuggestions.diarrhea',
  'records.symptomSuggestions.itching',
  'records.symptomSuggestions.coughing',
  'records.symptomSuggestions.limping',
] as const;

export type SymptomSuggestionKey = (typeof SYMPTOM_SUGGESTION_KEYS)[number];
