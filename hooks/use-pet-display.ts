import { useCallback } from 'react';

import { useTranslation } from '@/hooks/use-translation';
import type {
  HealthCondition,
  PetAgeGroup,
  PetSex,
  PetSpayNeuterStatus,
  PetSpecies,
} from '@/types/pet';
import { formatCheckInTitleDate } from '@/utils/date';

export function usePetDisplay() {
  const { t } = useTranslation();

  const displayPetText = useCallback(
    (value: string | null | undefined): string => {
      const trimmed = value?.trim();
      return trimmed ? trimmed : t('pet.notSet');
    },
    [t]
  );

  const displayPetSpecies = useCallback(
    (species: PetSpecies): string => t(`pet.options.species.${species}`),
    [t]
  );

  const displayPetBreed = useCallback(
    (breed: string | null | undefined): string => {
      if (!breed) {
        return t('pet.notSet');
      }

      const key = `pet.options.breeds.${breed}`;
      const translated = t(key);
      return translated === key ? breed : translated;
    },
    [t]
  );

  const displayPetAgeGroup = useCallback(
    (ageGroup: PetAgeGroup): string => t(`pet.options.ageGroup.${ageGroup}`),
    [t]
  );

  const displayPetSex = useCallback(
    (sex: PetSex | null | undefined): string => {
      if (!sex) {
        return t('pet.notSet');
      }

      return t(`pet.options.sex.${sex}`);
    },
    [t]
  );

  const displayPetSpayNeuterStatus = useCallback(
    (status: PetSpayNeuterStatus | null | undefined): string => {
      if (!status) {
        return t('pet.notSet');
      }

      return t(`pet.options.spayNeuter.${status}`);
    },
    [t]
  );

  const displayPetDate = useCallback(
    (date: string | null | undefined): string => {
      const trimmed = date?.trim();
      if (!trimmed) {
        return t('pet.notSet');
      }

      return formatCheckInTitleDate(trimmed);
    },
    [t]
  );

  const displayHealthConditions = useCallback(
    (conditions: HealthCondition[]): string => {
      if (conditions.length === 0 || (conditions.length === 1 && conditions[0] === 'none')) {
        return t('pet.none');
      }

      return conditions
        .map((condition) => t(`pet.options.healthCondition.${condition}`))
        .join(', ');
    },
    [t]
  );

  const getSpeciesLabel = useCallback(
    (species: PetSpecies): string => t(`pet.options.species.${species}`),
    [t]
  );

  const getAgeGroupLabel = useCallback(
    (ageGroup: PetAgeGroup): string => t(`pet.options.ageGroup.${ageGroup}`),
    [t]
  );

  const getSexLabel = useCallback((sex: PetSex): string => t(`pet.options.sex.${sex}`), [t]);

  const getSpayNeuterLabel = useCallback(
    (status: PetSpayNeuterStatus): string => t(`pet.options.spayNeuter.${status}`),
    [t]
  );

  const getHealthConditionLabel = useCallback(
    (condition: HealthCondition): string => t(`pet.options.healthCondition.${condition}`),
    [t]
  );

  const getBreedLabel = useCallback(
    (breed: string): string => {
      const key = `pet.options.breeds.${breed}`;
      const translated = t(key);
      return translated === key ? breed : translated;
    },
    [t]
  );

  return {
    displayPetText,
    displayPetSpecies,
    displayPetBreed,
    displayPetAgeGroup,
    displayPetSex,
    displayPetSpayNeuterStatus,
    displayPetDate,
    displayHealthConditions,
    getSpeciesLabel,
    getAgeGroupLabel,
    getSexLabel,
    getSpayNeuterLabel,
    getHealthConditionLabel,
    getBreedLabel,
  };
}
