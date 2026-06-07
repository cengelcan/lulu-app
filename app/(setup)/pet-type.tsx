import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';

import { SelectableOption } from '@/components/setup/selectable-option';
import { SetupScreen } from '@/components/setup/setup-screen';
import { PET_SPECIES_OPTIONS } from '@/constants/check-in';
import { useSetupStore, validateSpecies } from '@/stores/setup.store';

export default function PetTypeScreen() {
  const router = useRouter();
  const species = useSetupStore((state) => state.species);
  const setSpecies = useSetupStore((state) => state.setSpecies);
  const [error, setError] = useState<string | null>(null);

  const handleContinue = useCallback(() => {
    const validationError = validateSpecies(species);
    if (validationError) {
      setError(validationError);
      return;
    }

    router.push('/(setup)/pet-name');
  }, [router, species]);

  return (
    <SetupScreen
      step={1}
      title="What type of pet do you have?"
      description="Select one option to continue."
      onContinue={handleContinue}
      continueDisabled={!species}
      error={error}>
      {PET_SPECIES_OPTIONS.map((option) => (
        <SelectableOption
          key={option.value}
          label={option.label}
          selected={species === option.value}
          onPress={() => {
            setError(null);
            setSpecies(option.value);
          }}
        />
      ))}
    </SetupScreen>
  );
}
