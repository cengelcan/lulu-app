import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';

import { PetNameBreedForm } from '@/components/setup/PetNameBreedForm';
import { SetupScreen } from '@/components/setup/setup-screen';
import { getBreedOptionsForSpecies } from '@/constants/pet-breeds';
import { usePetDisplay } from '@/hooks/use-pet-display';
import { useTranslation } from '@/hooks/use-translation';
import { setupRoute, setupTotalSteps, useSetupMode } from '@/hooks/use-setup-mode';
import { useSetupScreenBack } from '@/hooks/use-setup-screen-back';
import { useSetupStore, validatePetName } from '@/stores/setup.store';
import { translateValidationError } from '@/utils/translate-error';

export default function PetNameBreedScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { getBreedLabel } = usePetDisplay();
  const mode = useSetupMode();
  const totalSteps = setupTotalSteps(mode);
  const { onBack } = useSetupScreenBack(2, mode);

  const species = useSetupStore((state) => state.species);
  const name = useSetupStore((state) => state.name);
  const breed = useSetupStore((state) => state.breed);
  const setName = useSetupStore((state) => state.setName);
  const setBreed = useSetupStore((state) => state.setBreed);
  const [error, setError] = useState<string | null>(null);

  const breedOptions = useMemo(() => {
    if (!species) {
      return [];
    }

    return getBreedOptionsForSpecies(species).map((option) => ({
      value: option.value,
      label: getBreedLabel(option.value),
    }));
  }, [getBreedLabel, species]);

  const handleContinue = useCallback(() => {
    const nameError = validatePetName(name);
    if (nameError) {
      setError(nameError);
      return;
    }

    setName(name.trim());
    router.push(setupRoute('/(setup)/pet-age-health', mode));
  }, [mode, name, router, setName]);

  return (
    <SetupScreen
      step={2}
      totalSteps={totalSteps}
      title={t('setup.petNameBreed.title')}
      description={t('setup.petNameBreed.description')}
      onContinue={handleContinue}
      onBack={onBack}
      continueDisabled={!name.trim()}
      error={translateValidationError(t, error)}>
      <PetNameBreedForm
        name={name}
        breed={breed}
        nameLabel={t('setup.petNameBreed.nameLabel')}
        breedLabel={t('setup.petNameBreed.breedLabel')}
        breedOptionalHint={t('common.optional')}
        namePlaceholder={t('setup.petNameBreed.namePlaceholder')}
        nameAccessibilityLabel={t('pet.fields.petName')}
        breedOptions={breedOptions}
        onNameChange={(value) => {
          setError(null);
          setName(value);
        }}
        onBreedChange={setBreed}
        onSubmit={handleContinue}
      />
    </SetupScreen>
  );
}
