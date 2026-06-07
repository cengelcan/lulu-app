import { useRouter } from 'expo-router';
import { useCallback } from 'react';

import { SelectableOption } from '@/components/setup/selectable-option';
import { SetupScreen } from '@/components/setup/setup-screen';
import { HEALTH_CONDITION_OPTIONS } from '@/constants/check-in';
import { useSetupStore } from '@/stores/setup.store';

export default function HealthConditionsScreen() {
  const router = useRouter();
  const healthConditions = useSetupStore((state) => state.healthConditions);
  const toggleHealthCondition = useSetupStore((state) => state.toggleHealthCondition);

  const handleContinue = useCallback(() => {
    router.push('/(setup)/check-in-prefs');
  }, [router]);

  return (
    <SetupScreen
      step={4}
      title="Any health conditions?"
      description="Select all that apply. You can skip this if none apply."
      onContinue={handleContinue}>
      {HEALTH_CONDITION_OPTIONS.map((option) => (
        <SelectableOption
          key={option.value}
          label={option.label}
          selected={healthConditions.includes(option.value)}
          onPress={() => toggleHealthCondition(option.value)}
        />
      ))}
    </SetupScreen>
  );
}
