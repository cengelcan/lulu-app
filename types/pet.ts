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

export type Pet = {
  id: string;
  name: string;
  species: PetSpecies;
  ageGroup: PetAgeGroup;
  healthConditions: HealthCondition[];
  photoUri?: string | null;
  createdAt: string;
};

export const PET_NAME_MIN_LENGTH = 1;
export const PET_NAME_MAX_LENGTH = 30;
