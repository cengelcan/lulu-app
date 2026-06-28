import { StyleSheet, TextInput, View } from 'react-native';

import { SelectableOption } from '@/components/setup/selectable-option';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { PET_NAME_MAX_LENGTH } from '@/types/pet';

type PetNameBreedFormProps = {
  name: string;
  breed: string | null;
  nameLabel: string;
  breedLabel: string;
  breedOptionalHint: string;
  namePlaceholder: string;
  nameAccessibilityLabel: string;
  breedOptions: { value: string; label: string }[];
  onNameChange: (name: string) => void;
  onBreedChange: (breed: string | null) => void;
  onSubmit?: () => void;
};

export function PetNameBreedForm({
  name,
  breed,
  nameLabel,
  breedLabel,
  breedOptionalHint,
  namePlaceholder,
  nameAccessibilityLabel,
  breedOptions,
  onNameChange,
  onBreedChange,
  onSubmit,
}: PetNameBreedFormProps) {
  const textColor = useThemeColor({}, 'text');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const surfaceColor = useThemeColor({}, 'surface');
  const brandAccentColor = useThemeColor({}, 'brandAccent');
  const brandAccentSoft = useThemeColor({}, 'brandAccentSoft');

  return (
    <View style={styles.form}>
      <View style={styles.section}>
        <ThemedText
          type="defaultSemiBold"
          lightColor={textSecondaryColor}
          darkColor={textSecondaryColor}
          style={styles.sectionLabel}>
          {nameLabel}
        </ThemedText>
        <View
          style={[
            styles.nameField,
            {
              backgroundColor: surfaceColor,
              borderColor: brandAccentColor,
              borderWidth: 1.5,
            },
          ]}>
          <View style={[styles.nameIconWrap, { backgroundColor: brandAccentSoft }]}>
            <IconSymbol name="pawprint.fill" size={18} color={brandAccentColor} />
          </View>
          <TextInput
            accessibilityLabel={nameAccessibilityLabel}
            autoCapitalize="words"
            autoCorrect={false}
            maxLength={PET_NAME_MAX_LENGTH}
            placeholder={namePlaceholder}
            placeholderTextColor={textSecondaryColor}
            returnKeyType="done"
            style={[styles.nameInput, { color: textColor }]}
            value={name}
            onChangeText={onNameChange}
            onSubmitEditing={onSubmit}
          />
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.breedHeader}>
          <ThemedText
            type="defaultSemiBold"
            lightColor={textSecondaryColor}
            darkColor={textSecondaryColor}
            style={styles.sectionLabel}>
            {breedLabel}
          </ThemedText>
          <ThemedText
            lightColor={textSecondaryColor}
            darkColor={textSecondaryColor}
            style={styles.optionalHint}>
            {breedOptionalHint}
          </ThemedText>
        </View>
        {breedOptions.map((option) => (
          <SelectableOption
            key={option.value}
            label={option.label}
            selected={breed === option.value}
            onPress={() => onBreedChange(breed === option.value ? null : option.value)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: Spacing.lg,
  },
  section: {
    gap: Spacing.sm,
  },
  sectionLabel: {
    ...Typography.caption,
    fontSize: 13,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  breedHeader: {
    gap: 2,
  },
  optionalHint: {
    ...Typography.caption,
  },
  nameField: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.xl,
    minHeight: 56,
    paddingHorizontal: Spacing.sm,
    gap: Spacing.sm,
  },
  nameIconWrap: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameInput: {
    ...Typography.body,
    flex: 1,
    paddingVertical: Spacing.md,
    paddingRight: Spacing.sm,
  },
});
