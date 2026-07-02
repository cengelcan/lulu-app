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
  icon: IconSymbolName;
  iconColor: string;
  translationKey: string;
  optionsTranslationKey: string;
  statusTranslationKey: string;
}[] = [
  {
    key: 'appetite',
    icon: 'fork.knife',
    iconColor: '#FDBA74',
    translationKey: 'checkIn.categories.appetite',
    optionsTranslationKey: 'checkIn.options.appetite',
    statusTranslationKey: 'checkIn.status.appetite',
  },
  {
    key: 'waterIntake',
    icon: 'drop.fill',
    iconColor: '#93C5FD',
    translationKey: 'checkIn.categories.waterIntake',
    optionsTranslationKey: 'checkIn.options.waterIntake',
    statusTranslationKey: 'checkIn.status.waterIntake',
  },
  {
    key: 'poop',
    icon: 'leaf.fill',
    iconColor: '#D6B36A',
    translationKey: 'checkIn.categories.poop',
    optionsTranslationKey: 'checkIn.options.poop',
    statusTranslationKey: 'checkIn.status.poop',
  },
  {
    key: 'pee',
    icon: 'drop.triangle.fill',
    iconColor: '#C4B5FD',
    translationKey: 'checkIn.categories.pee',
    optionsTranslationKey: 'checkIn.options.pee',
    statusTranslationKey: 'checkIn.status.pee',
  },
  {
    key: 'energy',
    icon: 'bolt.fill',
    iconColor: '#FDE68A',
    translationKey: 'checkIn.categories.energy',
    optionsTranslationKey: 'checkIn.options.energy',
    statusTranslationKey: 'checkIn.status.energy',
  },
  {
    key: 'mood',
    icon: 'face.smiling',
    iconColor: '#C4B5FD',
    translationKey: 'checkIn.categories.mood',
    optionsTranslationKey: 'checkIn.options.mood',
    statusTranslationKey: 'checkIn.status.mood',
  },
];

export const APPETITE_OPTIONS: CheckInOption<Appetite>[] = [
  { value: 'less', icon: 'arrow.down' },
  { value: 'normal', icon: 'face.smiling' },
  { value: 'more', icon: 'arrow.up' },
];

export const WATER_INTAKE_OPTIONS: CheckInOption<WaterIntake>[] = [
  { value: 'less', icon: 'arrow.down' },
  { value: 'normal', icon: 'face.smiling' },
  { value: 'more', icon: 'arrow.up' },
];

export const POOP_OPTIONS: CheckInOption<Poop>[] = [
  { value: 'not_observed', icon: 'eye.slash' },
  { value: 'normal', icon: 'face.smiling' },
  { value: 'not_normal', icon: 'exclamationmark.circle' },
];

export const PEE_OPTIONS: CheckInOption<Pee>[] = [
  { value: 'not_observed', icon: 'eye.slash' },
  { value: 'normal', icon: 'face.smiling' },
  { value: 'not_normal', icon: 'exclamationmark.circle' },
];

export const ENERGY_OPTIONS: CheckInOption<Energy>[] = [
  { value: 'low', icon: 'battery.25percent' },
  { value: 'normal', icon: 'battery.50percent' },
  { value: 'high', icon: 'bolt.fill' },
];

export const MOOD_OPTIONS: CheckInOption<Mood>[] = [
  { value: 'low', icon: 'exclamationmark.circle' },
  { value: 'normal', icon: 'face.smiling' },
  { value: 'high', icon: 'heart.fill' },
];

export const CHECK_IN_OPTIONS_BY_CATEGORY = {
  appetite: APPETITE_OPTIONS,
  waterIntake: WATER_INTAKE_OPTIONS,
  poop: POOP_OPTIONS,
  pee: PEE_OPTIONS,
  energy: ENERGY_OPTIONS,
  mood: MOOD_OPTIONS,
} as const;

export const CHECK_IN_NOTES_MAX_LENGTH = 500;

export const CHECK_IN_NORMAL_VALUES = {
  appetite: 'normal',
  waterIntake: 'normal',
  poop: 'normal',
  pee: 'normal',
  energy: 'normal',
  mood: 'normal',
} as const;
