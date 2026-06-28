import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';

import { PetAgeHealthForm } from '@/components/setup/PetAgeHealthForm';
import { SetupScreen } from '@/components/setup/setup-screen';
import { HEALTH_CONDITION_OPTIONS } from '@/constants/check-in';
import { usePetDisplay } from '@/hooks/use-pet-display';
import { useTranslation } from '@/hooks/use-translation';
import { setupRoute, setupTotalSteps, useSetupMode } from '@/hooks/use-setup-mode';
import { useSetupScreenBack } from '@/hooks/use-setup-screen-back';
import { useSetupStore, validateBirthDate } from '@/stores/setup.store';
import { formatSetupPetAgeHint } from '@/utils/pet-age';
import { translateValidationError } from '@/utils/translate-error';

export default function PetAgeHealthScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { getHealthConditionLabel } = usePetDisplay();
  const mode = useSetupMode();
  const totalSteps = setupTotalSteps(mode);
  const { onBack } = useSetupScreenBack(3, mode);

  const name = useSetupStore((state) => state.name);
  const species = useSetupStore((state) => state.species);
  const birthDate = useSetupStore((state) => state.birthDate);
  const healthConditions = useSetupStore((state) => state.healthConditions);
  const setBirthDate = useSetupStore((state) => state.setBirthDate);
  const toggleHealthCondition = useSetupStore((state) => state.toggleHealthCondition);
  const clearHealthConditions = useSetupStore((state) => state.clearHealthConditions);
  const [error, setError] = useState<string | null>(null);

  const healthOptions = useMemo(
    () =>
      HEALTH_CONDITION_OPTIONS.map((option) => ({
        value: option.value,
        label: getHealthConditionLabel(option.value),
      })),
    [getHealthConditionLabel]
  );

  const ageHint = useMemo(
    () => (birthDate.trim() ? formatSetupPetAgeHint(birthDate, name, t) : null),
    [birthDate, name, t]
  );

  const handleContinue = useCallback(() => {
    const validationError = validateBirthDate(birthDate);
    if (validationError) {
      setError(validationError);
      return;
    }

    router.push(setupRoute('/(setup)/pet-photo', mode));
  }, [birthDate, mode, router]);

  return (
    <SetupScreen
      step={3}
      totalSteps={totalSteps}
      title={t('setup.petAgeHealth.title')}
      description={t('setup.petAgeHealth.description')}
      onContinue={handleContinue}
      onBack={onBack}
      continueDisabled={!birthDate.trim()}
      error={translateValidationError(t, error)}>
      <PetAgeHealthForm
        species={species}
        birthDateLabel={t('setup.petAgeHealth.birthDateLabel')}
        birthDatePlaceholder={t('setup.petAgeHealth.birthDatePlaceholder')}
        birthDateAccessibilityLabel={t('setup.petAgeHealth.birthDateAccessibilityLabel')}
        ageHint={ageHint}
        healthLabel={t('setup.petAgeHealth.healthLabel')}
        healthOptionalHint={t('setup.petAgeHealth.healthOptionalHint')}
        healthPlaceholder={t('setup.petAgeHealth.healthPlaceholder')}
        healthNoResultsLabel={t('setup.petAgeHealth.healthNoResults')}
        healthAccessibilityLabel={t('setup.petAgeHealth.healthAccessibilityLabel')}
        birthDate={birthDate}
        healthConditions={healthConditions}
        healthOptions={healthOptions}
        onBirthDateChange={(value) => {
          setError(null);
          setBirthDate(value);
        }}
        onToggleHealthCondition={toggleHealthCondition}
        onClearHealthConditions={clearHealthConditions}
      />
    </SetupScreen>
  );
}
