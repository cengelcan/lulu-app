import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';

import { SelectableOption } from '@/components/setup/selectable-option';
import { SetupScreen } from '@/components/setup/setup-screen';
import { PET_AGE_GROUP_OPTIONS } from '@/constants/check-in';
import { usePetDisplay } from '@/hooks/use-pet-display';
import { useTranslation } from '@/hooks/use-translation';
import { setupRoute, setupTotalSteps, useSetupMode } from '@/hooks/use-setup-mode';
import { useSetupScreenBack } from '@/hooks/use-setup-screen-back';
import { useSetupStore, validateAgeGroup } from '@/stores/setup.store';
import { translateValidationError } from '@/utils/translate-error';

export default function PetAgeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { getAgeGroupLabel } = usePetDisplay();
  const mode = useSetupMode();
  const totalSteps = setupTotalSteps(mode);
  const { onBack } = useSetupScreenBack(4, mode);

  const ageGroup = useSetupStore((state) => state.ageGroup);
  const setAgeGroup = useSetupStore((state) => state.setAgeGroup);
  const [error, setError] = useState<string | null>(null);

  const handleContinue = useCallback(() => {
    const validationError = validateAgeGroup(ageGroup);
    if (validationError) {
      setError(validationError);
      return;
    }

    router.push(setupRoute('/(setup)/health-conditions', mode));
  }, [ageGroup, mode, router]);

  return (
    <SetupScreen
      step={4}
      totalSteps={totalSteps}
      title={t('setup.petAge.title')}
      description={t('setup.petAge.description')}
      onContinue={handleContinue}
      onBack={onBack}
      continueDisabled={!ageGroup}
      error={translateValidationError(t, error)}>
      {PET_AGE_GROUP_OPTIONS.map((option) => (
        <SelectableOption
          key={option.value}
          label={getAgeGroupLabel(option.value)}
          selected={ageGroup === option.value}
          onPress={() => {
            setError(null);
            setAgeGroup(option.value);
          }}
        />
      ))}
    </SetupScreen>
  );
}
