import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, TextInput } from 'react-native';

import { SetupScreen } from '@/components/setup/setup-screen';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { setupRoute, setupTotalSteps, useSetupMode } from '@/hooks/use-setup-mode';
import { PET_NAME_MAX_LENGTH } from '@/types/pet';
import { useSetupStore, validatePetName } from '@/stores/setup.store';

export default function PetNameScreen() {
  const router = useRouter();
  const mode = useSetupMode();
  const totalSteps = setupTotalSteps(mode);

  const name = useSetupStore((state) => state.name);
  const setName = useSetupStore((state) => state.setName);
  const [error, setError] = useState<string | null>(null);

  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');
  const surfaceColor = useThemeColor({}, 'surface');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');

  const handleContinue = useCallback(() => {
    const validationError = validatePetName(name);
    if (validationError) {
      setError(validationError);
      return;
    }

    setName(name.trim());
    router.push(setupRoute('/(setup)/pet-age', mode));
  }, [mode, name, router, setName]);

  return (
    <SetupScreen
      step={2}
      totalSteps={totalSteps}
      title="What's your pet's name?"
      description={`Enter a name between 1 and ${PET_NAME_MAX_LENGTH} characters.`}
      onContinue={handleContinue}
      continueDisabled={!name.trim()}
      error={error}>
      <TextInput
        accessibilityLabel="Pet name"
        autoCapitalize="words"
        autoCorrect={false}
        maxLength={PET_NAME_MAX_LENGTH}
        placeholder="Pet name"
        placeholderTextColor={textSecondaryColor}
        returnKeyType="done"
        style={[
          styles.input,
          {
            color: textColor,
            backgroundColor: surfaceColor,
            borderColor,
          },
        ]}
        value={name}
        onChangeText={(value) => {
          setError(null);
          setName(value);
        }}
        onSubmitEditing={handleContinue}
      />
    </SetupScreen>
  );
}

const styles = StyleSheet.create({
  input: {
    ...Typography.body,
    borderWidth: 1,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    minHeight: 52,
  },
});
