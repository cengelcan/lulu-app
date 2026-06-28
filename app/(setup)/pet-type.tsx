import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';

import { PetSpeciesSelector } from '@/components/setup/PetSpeciesSelector';
import { SetupScreen } from '@/components/setup/setup-screen';
import { usePetDisplay } from '@/hooks/use-pet-display';
import { useTranslation } from '@/hooks/use-translation';
import { setupRoute, setupTotalSteps, useSetupMode } from '@/hooks/use-setup-mode';
import { useSetupScreenBack } from '@/hooks/use-setup-screen-back';
import { useSetupStore, validateSpecies } from '@/stores/setup.store';
import { translateValidationError } from '@/utils/translate-error';

export default function PetTypeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { getSpeciesLabel } = usePetDisplay();
  const mode = useSetupMode();
  const totalSteps = setupTotalSteps(mode);
  const { showBack, onBack } = useSetupScreenBack(1, mode);

  const species = useSetupStore((state) => state.species);
  const setSpecies = useSetupStore((state) => state.setSpecies);
  const [error, setError] = useState<string | null>(null);

  const handleContinue = useCallback(() => {
    const validationError = validateSpecies(species);
    if (validationError) {
      setError(validationError);
      return;
    }

    router.push(setupRoute('/(setup)/pet-name-breed', mode));
  }, [mode, router, species]);

  return (
    <SetupScreen
      step={1}
      totalSteps={totalSteps}
      title={t('setup.petType.title')}
      description={t('setup.petType.description')}
      onContinue={handleContinue}
      onBack={showBack ? onBack : undefined}
      continueDisabled={!species}
      error={translateValidationError(t, error)}>
      <PetSpeciesSelector
        selected={species}
        getLabel={getSpeciesLabel}
        onSelect={(value) => {
          setError(null);
          setSpecies(value);
        }}
      />
    </SetupScreen>
  );
}
