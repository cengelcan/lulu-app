import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';

import { PetAgeHealthForm } from '@/components/setup/PetAgeHealthForm';
import { SetupScreen } from '@/components/setup/setup-screen';
import { HEALTH_CONDITION_OPTIONS, PET_AGE_GROUP_OPTIONS } from '@/constants/check-in';
import { usePetDisplay } from '@/hooks/use-pet-display';
import { useTranslation } from '@/hooks/use-translation';
import { setupRoute, setupTotalSteps, useSetupMode } from '@/hooks/use-setup-mode';
import { useSetupScreenBack } from '@/hooks/use-setup-screen-back';
import { useSetupStore, validateAgeGroup } from '@/stores/setup.store';
import { translateValidationError } from '@/utils/translate-error';

export default function PetAgeHealthScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { getAgeGroupLabel, getHealthConditionLabel } = usePetDisplay();
  const mode = useSetupMode();
  const totalSteps = setupTotalSteps(mode);
  const { onBack } = useSetupScreenBack(3, mode);

  const ageGroup = useSetupStore((state) => state.ageGroup);
  const healthConditions = useSetupStore((state) => state.healthConditions);
  const setAgeGroup = useSetupStore((state) => state.setAgeGroup);
  const toggleHealthCondition = useSetupStore((state) => state.toggleHealthCondition);
  const [error, setError] = useState<string | null>(null);

  const ageOptions = useMemo(
    () =>
      PET_AGE_GROUP_OPTIONS.map((option) => ({
        value: option.value,
        label: getAgeGroupLabel(option.value),
      })),
    [getAgeGroupLabel]
  );

  const healthOptions = useMemo(
    () =>
      HEALTH_CONDITION_OPTIONS.map((option) => ({
        value: option.value,
        label: getHealthConditionLabel(option.value),
      })),
    [getHealthConditionLabel]
  );

  const handleContinue = useCallback(() => {
    const validationError = validateAgeGroup(ageGroup);
    if (validationError) {
      setError(validationError);
      return;
    }

    router.push(setupRoute('/(setup)/pet-photo', mode));
  }, [ageGroup, mode, router]);

  return (
    <SetupScreen
      step={3}
      totalSteps={totalSteps}
      title={t('setup.petAgeHealth.title')}
      description={t('setup.petAgeHealth.description')}
      onContinue={handleContinue}
      onBack={onBack}
      continueDisabled={!ageGroup}
      error={translateValidationError(t, error)}>
      <PetAgeHealthForm
        ageLabel={t('setup.petAgeHealth.ageLabel')}
        healthLabel={t('setup.petAgeHealth.healthLabel')}
        healthOptionalHint={t('setup.petAgeHealth.healthOptionalHint')}
        ageGroup={ageGroup}
        healthConditions={healthConditions}
        ageOptions={ageOptions}
        healthOptions={healthOptions}
        onAgeGroupChange={(value) => {
          setError(null);
          setAgeGroup(value);
        }}
        onToggleHealthCondition={toggleHealthCondition}
      />
    </SetupScreen>
  );
}
