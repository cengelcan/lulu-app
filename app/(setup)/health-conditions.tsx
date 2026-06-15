import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';

import { SelectableOption } from '@/components/setup/selectable-option';
import { SetupScreen } from '@/components/setup/setup-screen';
import { HEALTH_CONDITION_OPTIONS } from '@/constants/check-in';
import { usePetDisplay } from '@/hooks/use-pet-display';
import { useTranslation } from '@/hooks/use-translation';
import { setupRoute, setupTotalSteps, useSetupMode } from '@/hooks/use-setup-mode';
import { useSetupScreenBack } from '@/hooks/use-setup-screen-back';
import { finalizeAddModePet, validateSetupDraft } from '@/services/setup/finalize-pet-creation';
import { useCheckInStore } from '@/stores/check-in.store';
import { usePetStore } from '@/stores/pet.store';
import { useSetupStore } from '@/stores/setup.store';
import { translateValidationError } from '@/utils/translate-error';

export default function HealthConditionsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { getHealthConditionLabel } = usePetDisplay();
  const mode = useSetupMode();
  const totalSteps = setupTotalSteps(mode);
  const { onBack } = useSetupScreenBack(5, mode);

  const species = useSetupStore((state) => state.species);
  const breed = useSetupStore((state) => state.breed);
  const name = useSetupStore((state) => state.name);
  const ageGroup = useSetupStore((state) => state.ageGroup);
  const healthConditions = useSetupStore((state) => state.healthConditions);
  const toggleHealthCondition = useSetupStore((state) => state.toggleHealthCondition);
  const resetDraft = useSetupStore((state) => state.resetDraft);

  const createPet = usePetStore((state) => state.createPet);
  const setActivePet = usePetStore((state) => state.setActivePet);
  const petIsLoading = usePetStore((state) => state.isLoading);
  const petError = usePetStore((state) => state.error);
  const clearPetError = usePetStore((state) => state.clearError);

  const loadCheckIns = useCheckInStore((state) => state.loadCheckIns);

  const [validationError, setValidationError] = useState<string | null>(null);

  const handleContinueInitial = useCallback(() => {
    router.push(setupRoute('/(setup)/check-in-prefs', mode));
  }, [mode, router]);

  const handleContinueAdd = useCallback(async () => {
    const draft = { species, breed, name, ageGroup, healthConditions };
    const draftError = validateSetupDraft(draft);

    if (draftError) {
      setValidationError(draftError);
      return;
    }

    setValidationError(null);
    clearPetError();

    try {
      await finalizeAddModePet(draft, {
        createPet,
        setActivePet,
        loadCheckIns,
        resetDraft,
        router,
      });
    } catch {
      // Store sets error state.
    }
  }, [
    ageGroup,
    breed,
    clearPetError,
    createPet,
    healthConditions,
    loadCheckIns,
    name,
    resetDraft,
    router,
    setActivePet,
    species,
  ]);

  const handleContinue = useCallback(() => {
    if (mode === 'add') {
      void handleContinueAdd();
      return;
    }

    handleContinueInitial();
  }, [handleContinueAdd, handleContinueInitial, mode]);

  const error = translateValidationError(t, validationError) ?? petError;

  return (
    <SetupScreen
      step={5}
      totalSteps={totalSteps}
      title={t('setup.healthConditions.title')}
      description={t('setup.healthConditions.description')}
      onContinue={handleContinue}
      onBack={onBack}
      buttonTitle={mode === 'add' ? t('setup.healthConditions.addPet') : t('common.continue')}
      isLoading={mode === 'add' ? petIsLoading : false}
      error={error}>
      {HEALTH_CONDITION_OPTIONS.map((option) => (
        <SelectableOption
          key={option.value}
          label={getHealthConditionLabel(option.value)}
          selected={healthConditions.includes(option.value)}
          onPress={() => toggleHealthCondition(option.value)}
        />
      ))}
    </SetupScreen>
  );
}
