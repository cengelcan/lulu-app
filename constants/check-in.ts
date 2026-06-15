import type {
  Appetite,
  CheckInCategory,
  Energy,
  Mood,
  Pee,
  Poop,
  WaterIntake,
} from '@/types/check-in';
import type { IconSymbolName } from '@/components/ui/icon-symbol';
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

type CheckInOption<T extends string> = {
  value: T;
  icon: IconSymbolName;
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

export const CHECK_IN_CATEGORIES: {
  key: CheckInCategory;
  emoji: string;
  translationKey: string;
  optionsTranslationKey: string;
}[] = [
  {
    key: 'appetite',
    emoji: '🍗',
    translationKey: 'checkIn.categories.appetite',
    optionsTranslationKey: 'checkIn.options.appetite',
  },
  {
    key: 'waterIntake',
    emoji: '💧',
    translationKey: 'checkIn.categories.waterIntake',
    optionsTranslationKey: 'checkIn.options.waterIntake',
  },
  {
    key: 'energy',
    emoji: '⚡',
    translationKey: 'checkIn.categories.energy',
    optionsTranslationKey: 'checkIn.options.energy',
  },
  {
    key: 'mood',
    emoji: '😊',
    translationKey: 'checkIn.categories.mood',
    optionsTranslationKey: 'checkIn.options.mood',
  },
  {
    key: 'pee',
    emoji: '🚽',
    translationKey: 'checkIn.categories.pee',
    optionsTranslationKey: 'checkIn.options.pee',
  },
  {
    key: 'poop',
    emoji: '💩',
    translationKey: 'checkIn.categories.poop',
    optionsTranslationKey: 'checkIn.options.poop',
  },
];

export const APPETITE_OPTIONS: CheckInOption<Appetite>[] = [
  { value: 'no_appetite', icon: 'fork.knife.circle' },
  { value: 'reduced', icon: 'arrow.down.circle' },
  { value: 'normal', icon: 'checkmark.circle' },
  { value: 'increased', icon: 'arrow.up.circle' },
];

export const WATER_INTAKE_OPTIONS: CheckInOption<WaterIntake>[] = [
  { value: 'very_low', icon: 'drop' },
  { value: 'low', icon: 'drop.halffull' },
  { value: 'normal', icon: 'drop.fill' },
  { value: 'high', icon: 'drop.triangle.fill' },
  { value: 'very_high', icon: 'humidity.fill' },
];

export const ENERGY_OPTIONS: CheckInOption<Energy>[] = [
  { value: 'very_low', icon: 'battery.0percent' },
  { value: 'low', icon: 'battery.25percent' },
  { value: 'normal', icon: 'battery.50percent' },
  { value: 'high', icon: 'battery.75percent' },
  { value: 'very_high', icon: 'bolt.fill' },
];

export const MOOD_OPTIONS: CheckInOption<Mood>[] = [
  { value: 'restless', icon: 'wind' },
  { value: 'irritable', icon: 'cloud.bolt' },
  { value: 'normal', icon: 'face.smiling' },
  { value: 'happy', icon: 'heart.fill' },
  { value: 'playful', icon: 'sparkles' },
];

export const PEE_OPTIONS: CheckInOption<Pee>[] = [
  { value: 'straining', icon: 'exclamationmark.triangle' },
  { value: 'less_than_normal', icon: 'arrow.down' },
  { value: 'normal', icon: 'checkmark' },
  { value: 'more_than_normal', icon: 'arrow.up' },
  { value: 'not_observed', icon: 'eye.slash' },
];

export const POOP_OPTIONS: CheckInOption<Poop>[] = [
  { value: 'diarrhea', icon: 'drop.fill' },
  { value: 'soft', icon: 'circle.lefthalf.filled' },
  { value: 'normal', icon: 'checkmark.circle' },
  { value: 'hard', icon: 'circle.righthalf.filled' },
  { value: 'none', icon: 'xmark.circle' },
  { value: 'not_observed', icon: 'eye.slash' },
];

export const CHECK_IN_OPTIONS_BY_CATEGORY = {
  appetite: APPETITE_OPTIONS,
  waterIntake: WATER_INTAKE_OPTIONS,
  energy: ENERGY_OPTIONS,
  mood: MOOD_OPTIONS,
  pee: PEE_OPTIONS,
  poop: POOP_OPTIONS,
} as const;

export const CHECK_IN_NOTES_MAX_LENGTH = 500;

export const CHECK_IN_NORMAL_VALUES = {
  appetite: 'normal',
  waterIntake: 'normal',
  energy: 'normal',
  mood: 'normal',
  pee: 'normal',
  poop: 'normal',
} as const;
