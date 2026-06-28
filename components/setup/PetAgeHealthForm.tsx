import { StyleSheet, View } from 'react-native';

import { SelectableOption } from '@/components/setup/selectable-option';
import { ThemedText } from '@/components/themed-text';
import { Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import type { HealthCondition, PetAgeGroup } from '@/types/pet';

type Option<T extends string> = {
  value: T;
  label: string;
};

type PetAgeHealthFormProps = {
  ageLabel: string;
  healthLabel: string;
  healthOptionalHint: string;
  ageGroup: PetAgeGroup | null;
  healthConditions: HealthCondition[];
  ageOptions: Option<PetAgeGroup>[];
  healthOptions: Option<HealthCondition>[];
  onAgeGroupChange: (ageGroup: PetAgeGroup) => void;
  onToggleHealthCondition: (condition: HealthCondition) => void;
};

export function PetAgeHealthForm({
  ageLabel,
  healthLabel,
  healthOptionalHint,
  ageGroup,
  healthConditions,
  ageOptions,
  healthOptions,
  onAgeGroupChange,
  onToggleHealthCondition,
}: PetAgeHealthFormProps) {
  const textSecondaryColor = useThemeColor({}, 'textSecondary');

  return (
    <View style={styles.form}>
      <View style={styles.section}>
        <ThemedText
          type="defaultSemiBold"
          lightColor={textSecondaryColor}
          darkColor={textSecondaryColor}
          style={styles.sectionLabel}>
          {ageLabel}
        </ThemedText>
        {ageOptions.map((option) => (
          <SelectableOption
            key={option.value}
            label={option.label}
            selected={ageGroup === option.value}
            onPress={() => onAgeGroupChange(option.value)}
          />
        ))}
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
        {healthOptions.map((option) => (
          <SelectableOption
            key={option.value}
            label={option.label}
            selected={healthConditions.includes(option.value)}
            onPress={() => onToggleHealthCondition(option.value)}
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
  healthHeader: {
    gap: 2,
  },
  optionalHint: {
    ...Typography.caption,
  },
});
