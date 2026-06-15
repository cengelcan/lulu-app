import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

import { SelectableOption } from '@/components/setup/selectable-option';
import { SetupScreen } from '@/components/setup/setup-screen';
import { PET_SPECIES_OPTIONS } from '@/constants/check-in';
import { setupRoute, setupTotalSteps, useSetupMode } from '@/hooks/use-setup-mode';
import { useSetupScreenBack } from '@/hooks/use-setup-screen-back';
import { useSetupStore, validateSpecies } from '@/stores/setup.store';

export default function PetTypeScreen() {
  const router = useRouter();
  const mode = useSetupMode();
  const totalSteps = setupTotalSteps(mode);
  const { showBack, onBack } = useSetupScreenBack(1, mode);

  const species = useSetupStore((state) => state.species);
  const setSpecies = useSetupStore((state) => state.setSpecies);
  const resetDraft = useSetupStore((state) => state.resetDraft);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (mode === 'add') {
      resetDraft();
    }
  }, [mode, resetDraft]);

  const handleContinue = useCallback(() => {
    const validationError = validateSpecies(species);
    if (validationError) {
      setError(validationError);
      return;
    }

    router.push(setupRoute('/(setup)/pet-name', mode));
  }, [mode, router, species]);

  return (
    <SetupScreen
      step={1}
      totalSteps={totalSteps}
      title="What type of pet do you have?"
      description="Select one option to continue."
      onContinue={handleContinue}
      onBack={showBack ? onBack : undefined}
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
