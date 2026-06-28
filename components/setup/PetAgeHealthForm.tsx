import { Image } from 'expo-image';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { HealthConditionsSearchField } from '@/components/setup/HealthConditionsSearchField';
import { ThemedText } from '@/components/themed-text';
import { DatePickerField } from '@/components/ui/DatePickerField';
import { PET_SPECIES_ICONS } from '@/constants/pet-species';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import type { HealthCondition, PetSpecies } from '@/types/pet';
import { getPetAgeParts } from '@/utils/pet-age';

const AGE_HINT_ICON_SIZE = 24;

type Option<T extends string> = {
  value: T;
  label: string;
};

type PetAgeHealthFormProps = {
  species: PetSpecies | null;
  birthDateLabel: string;
  birthDatePlaceholder: string;
  birthDateAccessibilityLabel: string;
  ageHint: string | null;
  healthLabel: string;
  healthOptionalHint: string;
  healthPlaceholder: string;
  healthNoResultsLabel: string;
  healthAccessibilityLabel: string;
  birthDate: string;
  healthConditions: HealthCondition[];
  healthOptions: Option<HealthCondition>[];
  onBirthDateChange: (birthDate: string) => void;
  onToggleHealthCondition: (condition: HealthCondition) => void;
  onClearHealthConditions: () => void;
};

export function PetAgeHealthForm({
  species,
  birthDateLabel,
  birthDatePlaceholder,
  birthDateAccessibilityLabel,
  ageHint,
  healthLabel,
  healthOptionalHint,
  healthPlaceholder,
  healthNoResultsLabel,
  healthAccessibilityLabel,
  birthDate,
  healthConditions,
  healthOptions,
  onBirthDateChange,
  onToggleHealthCondition,
  onClearHealthConditions,
}: PetAgeHealthFormProps) {
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const brandAccentColor = useThemeColor({}, 'brandAccent');
  const brandAccentSoft = useThemeColor({}, 'brandAccentSoft');
  const brandAccentBorder = useThemeColor({}, 'brandAccentBorder');

  const hasBirthDate = useMemo(() => Boolean(getPetAgeParts(birthDate)), [birthDate]);

  return (
    <View style={styles.form}>
      <View style={styles.section}>
        <ThemedText
          type="defaultSemiBold"
          lightColor={textSecondaryColor}
          darkColor={textSecondaryColor}
          style={styles.sectionLabel}>
          {birthDateLabel}
        </ThemedText>
        <DatePickerField
          accessibilityLabel={birthDateAccessibilityLabel}
          displayFormat="full"
          placeholder={birthDatePlaceholder}
          value={birthDate}
          onChange={onBirthDateChange}
        />
        {hasBirthDate && ageHint ? (
          <View
            style={[
              styles.ageHintCard,
              {
                backgroundColor: brandAccentSoft,
                borderColor: brandAccentBorder,
              },
            ]}>
            {species ? (
              <View style={[styles.ageHintIconWrap, { backgroundColor: brandAccentSoft }]}>
                <Image
                  accessibilityIgnoresInvertColors
                  contentFit="contain"
                  source={PET_SPECIES_ICONS[species]}
                  style={styles.ageHintIcon}
                />
              </View>
            ) : null}
            <ThemedText
              lightColor={brandAccentColor}
              darkColor={brandAccentColor}
              style={styles.ageHintText}>
              {ageHint}
            </ThemedText>
          </View>
        ) : null}
      </View>

      <View style={styles.section}>
        <View style={styles.healthHeader}>
          <ThemedText
            type="defaultSemiBold"
            lightColor={textSecondaryColor}
            darkColor={textSecondaryColor}
            style={styles.sectionLabel}>
            {healthLabel}
          </ThemedText>
          <ThemedText
            lightColor={textSecondaryColor}
            darkColor={textSecondaryColor}
            style={styles.optionalHint}>
            {healthOptionalHint}
          </ThemedText>
        </View>
        <HealthConditionsSearchField
          healthConditions={healthConditions}
          healthOptions={healthOptions}
          placeholder={healthPlaceholder}
          noResultsLabel={healthNoResultsLabel}
          accessibilityLabel={healthAccessibilityLabel}
          onToggleHealthCondition={onToggleHealthCondition}
          onClearHealthConditions={onClearHealthConditions}
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
  ageHintCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: Radius.lg,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  ageHintIconWrap: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ageHintIcon: {
    width: AGE_HINT_ICON_SIZE,
    height: AGE_HINT_ICON_SIZE,
  },
  ageHintText: {
    ...Typography.body,
    flex: 1,
    lineHeight: 22,
  },
  healthHeader: {
    gap: 2,
  },
  optionalHint: {
    ...Typography.caption,
  },
});
