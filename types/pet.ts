export type PetSpecies = 'cat' | 'dog';

export type PetAgeGroup =
  | 'under_1_year'
  | '1_3_years'
  | '4_7_years'
  | '8_12_years'
  | '13_plus_years';

export type HealthCondition =
  | 'none'
  | 'kidney_disease'
  | 'diabetes'
  | 'allergy'
  | 'heart_disease'
  | 'arthritis'
  | 'other'
  | 'not_sure';

export type PetSex = 'male' | 'female' | 'unknown';

export type PetSpayNeuterStatus =
  | 'spayed'
  | 'neutered'
  | 'not_spayed_neutered'
  | 'unknown';

export type Pet = {
  id: string;
  name: string;
  species: PetSpecies;
  breed?: string | null;
  ageGroup: PetAgeGroup;
  healthConditions: HealthCondition[];
  photoUri?: string | null;
  color?: string | null;
  sex?: PetSex | null;
  spayNeuterStatus?: PetSpayNeuterStatus | null;
  birthDate?: string | null;
  adoptionDate?: string | null;
  microchipId?: string | null;
  ownerName?: string | null;
  createdAt: string;
};

export const PET_NAME_MIN_LENGTH = 1;
export const PET_NAME_MAX_LENGTH = 30;
export const PET_COLOR_MAX_LENGTH = 50;
export const PET_OWNER_MAX_LENGTH = 50;
export const PET_MICROCHIP_MAX_LENGTH = 50;
