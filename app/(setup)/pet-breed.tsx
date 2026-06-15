import { useRouter } from 'expo-router';
import { useCallback } from 'react';

import { SelectableOption } from '@/components/setup/selectable-option';
import { SetupScreen } from '@/components/setup/setup-screen';
import { getBreedOptionsForSpecies } from '@/constants/pet-breeds';
import { usePetDisplay } from '@/hooks/use-pet-display';
import { useTranslation } from '@/hooks/use-translation';
import { setupRoute, setupTotalSteps, useSetupMode } from '@/hooks/use-setup-mode';
import { useSetupScreenBack } from '@/hooks/use-setup-screen-back';
import { useSetupStore } from '@/stores/setup.store';

export default function PetBreedScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { getBreedLabel } = usePetDisplay();
  const mode = useSetupMode();
  const totalSteps = setupTotalSteps(mode);
  const { onBack } = useSetupScreenBack(3, mode);

  const species = useSetupStore((state) => state.species);
  const breed = useSetupStore((state) => state.breed);
  const setBreed = useSetupStore((state) => state.setBreed);

  const handleContinue = useCallback(() => {
    router.push(setupRoute('/(setup)/pet-age', mode));
  }, [mode, router]);

  const breedOptions = species ? getBreedOptionsForSpecies(species) : [];

  return (
    <SetupScreen
      step={3}
      totalSteps={totalSteps}
      title={t('setup.petBreed.title')}
      description={t('setup.petBreed.description')}
      onContinue={handleContinue}
      onBack={onBack}
      error={null}>
      {breedOptions.map((option) => (
        <SelectableOption
          key={option.value}
          label={getBreedLabel(option.value)}
          selected={breed === option.value}
          onPress={() => setBreed(breed === option.value ? null : option.value)}
        />
      ))}
    </SetupScreen>
  );
}
