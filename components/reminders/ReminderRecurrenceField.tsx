import * as Haptics from 'expo-haptics';
import { StyleSheet, View } from 'react-native';

import { SelectableOption } from '@/components/setup/selectable-option';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTranslation } from '@/hooks/use-translation';
import type { ReminderRecurrence, ReminderRecurrenceFrequency } from '@/types/pet-reminder';

const RECURRENCE_OPTIONS: readonly ReminderRecurrenceFrequency[] = [
  'none',
  'daily',
  'weekly',
  'monthly',
  'yearly',
] as const;

type ReminderRecurrenceFieldProps = {
  value: ReminderRecurrence;
  onChange: (value: ReminderRecurrence) => void;
};

export function ReminderRecurrenceField({ value, onChange }: ReminderRecurrenceFieldProps) {
  const { t } = useTranslation();

  const handleSelect = (frequency: ReminderRecurrenceFrequency) => {
    if (process.env.EXPO_OS === 'ios') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onChange({ frequency });
  };

  return (
    <View style={styles.section}>
      <ThemedText type="defaultSemiBold">{t('reminders.fields.recurrence')}</ThemedText>
      <View style={styles.options}>
        {RECURRENCE_OPTIONS.map((frequency) => (
          <SelectableOption
            key={frequency}
            label={t(`reminders.recurrence.${frequency}`)}
            selected={value.frequency === frequency}
            onPress={() => handleSelect(frequency)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.sm,
  },
  options: {
    gap: Spacing.sm,
  },
});
