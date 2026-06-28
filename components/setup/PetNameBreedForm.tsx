import { Image } from 'expo-image';
import { StyleSheet, TextInput, View } from 'react-native';

import { BreedSearchField } from '@/components/setup/BreedSearchField';
import { ThemedText } from '@/components/themed-text';
import { PET_SPECIES_ICONS } from '@/constants/pet-species';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { PET_NAME_MAX_LENGTH, type PetSpecies } from '@/types/pet';

const NAME_FIELD_ICON_SIZE = 24;

type PetNameBreedFormProps = {
  species: PetSpecies | null;
  name: string;
  breed: string | null;
  nameLabel: string;
  breedLabel: string;
  breedOptionalHint: string;
  breedPlaceholder: string;
  breedNoResultsLabel: string;
  breedAccessibilityLabel: string;
  namePlaceholder: string;
  nameAccessibilityLabel: string;
  breedOptions: { value: string; label: string }[];
  onNameChange: (name: string) => void;
  onBreedChange: (breed: string | null) => void;
  onSubmit?: () => void;
};

export function PetNameBreedForm({
  species,
  name,
  breed,
  nameLabel,
  breedLabel,
  breedOptionalHint,
  breedPlaceholder,
  breedNoResultsLabel,
  breedAccessibilityLabel,
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
          {species ? (
            <View style={[styles.nameIconWrap, { backgroundColor: brandAccentSoft }]}>
              <Image
                accessibilityIgnoresInvertColors
                contentFit="contain"
                source={PET_SPECIES_ICONS[species]}
                style={styles.nameIcon}
              />
            </View>
          ) : null}
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
        <BreedSearchField
          breed={breed}
          breedOptions={breedOptions}
          placeholder={breedPlaceholder}
          noResultsLabel={breedNoResultsLabel}
          accessibilityLabel={breedAccessibilityLabel}
          onBreedChange={onBreedChange}
        />
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
  nameIcon: {
    width: NAME_FIELD_ICON_SIZE,
    height: NAME_FIELD_ICON_SIZE,
  },
  nameInput: {
    ...Typography.body,
    flex: 1,
    paddingVertical: Spacing.md,
    paddingRight: Spacing.sm,
  },
});
