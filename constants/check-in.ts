import type { Appetite, CheckInPreference, Energy, Symptom } from '@/types/check-in';
import type {
  HealthCondition,
  PetAgeGroup,
  PetSex,
  PetSpayNeuterStatus,
  PetSpecies,
} from '@/types/pet';

type Option<T extends string> = {
  value: T;
  label: string;
};

export const PET_SPECIES_OPTIONS: Option<PetSpecies>[] = [
  { value: 'cat', label: 'Cat' },
  { value: 'dog', label: 'Dog' },
];

export const PET_SEX_OPTIONS: Option<PetSex>[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'unknown', label: 'Unknown' },
];

export const PET_SPAY_NEUTER_STATUS_OPTIONS: Option<PetSpayNeuterStatus>[] = [
  { value: 'spayed', label: 'Spayed' },
  { value: 'neutered', label: 'Neutered' },
  { value: 'not_spayed_neutered', label: 'Not Spayed / Neutered' },
  { value: 'unknown', label: 'Unknown' },
];

export const PET_AGE_GROUP_OPTIONS: Option<PetAgeGroup>[] = [
  { value: 'under_1_year', label: 'Under 1 Year' },
  { value: '1_3_years', label: '1-3 Years' },
  { value: '4_7_years', label: '4-7 Years' },
  { value: '8_12_years', label: '8-12 Years' },
  { value: '13_plus_years', label: '13+ Years' },
];

export const HEALTH_CONDITION_OPTIONS: Option<HealthCondition>[] = [
  { value: 'none', label: 'None' },
  { value: 'kidney_disease', label: 'Kidney Disease' },
  { value: 'diabetes', label: 'Diabetes' },
  { value: 'allergy', label: 'Allergy' },
  { value: 'heart_disease', label: 'Heart Disease' },
  { value: 'arthritis', label: 'Arthritis' },
  { value: 'other', label: 'Other' },
  { value: 'not_sure', label: 'Not Sure' },
];

export const CHECK_IN_PREFERENCE_OPTIONS: Option<CheckInPreference>[] = [
  { value: 'morning', label: 'Morning' },
  { value: 'afternoon', label: 'Afternoon' },
  { value: 'evening', label: 'Evening' },
  { value: 'multiple_times_daily', label: 'Multiple Times Daily' },
];

export const APPETITE_OPTIONS: Option<Appetite>[] = [
  { value: 'good', label: 'Good' },
  { value: 'normal', label: 'Normal' },
  { value: 'reduced', label: 'Reduced' },
  { value: 'not_eating', label: 'Not Eating' },
];

export const ENERGY_OPTIONS: Option<Energy>[] = [
  { value: 'high', label: 'High' },
  { value: 'normal', label: 'Normal' },
  { value: 'low', label: 'Low' },
];

export const SYMPTOM_OPTIONS: Option<Symptom>[] = [
  { value: 'none', label: 'None' },
  { value: 'vomiting', label: 'Vomiting' },
  { value: 'diarrhea', label: 'Diarrhea' },
  { value: 'other', label: 'Other' },
];

export const CHECK_IN_NOTES_MAX_LENGTH = 500;
