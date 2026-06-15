import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, TextInput } from 'react-native';

import { SetupScreen } from '@/components/setup/setup-screen';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/use-translation';
import { setupRoute, setupTotalSteps, useSetupMode } from '@/hooks/use-setup-mode';
import { useSetupScreenBack } from '@/hooks/use-setup-screen-back';
import { PET_NAME_MAX_LENGTH } from '@/types/pet';
import { useSetupStore, validatePetName } from '@/stores/setup.store';
import { translateValidationError } from '@/utils/translate-error';

export default function PetNameScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const mode = useSetupMode();
  const totalSteps = setupTotalSteps(mode);
  const { onBack } = useSetupScreenBack(2, mode);

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
    router.push(setupRoute('/(setup)/pet-breed', mode));
  }, [mode, name, router, setName]);

  return (
    <SetupScreen
      step={2}
      totalSteps={totalSteps}
      title={t('setup.petName.title')}
      description={t('setup.petName.description', { max: PET_NAME_MAX_LENGTH })}
      onContinue={handleContinue}
      onBack={onBack}
      continueDisabled={!name.trim()}
      error={translateValidationError(t, error)}>
      <TextInput
        accessibilityLabel={t('pet.fields.petName')}
        autoCapitalize="words"
        autoCorrect={false}
        maxLength={PET_NAME_MAX_LENGTH}
        placeholder={t('setup.petName.placeholder')}
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
