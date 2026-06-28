import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { TimePickerField } from '@/components/ui/TimePickerField';
import {
  CHECK_IN_REMINDER_PRESETS,
  findMatchingReminderPreset,
  type CheckInReminderPresetId,
} from '@/constants/reminder';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import type { ReminderTime } from '@/types/reminder';
import { formatReminderTime } from '@/utils/time';

type CheckInReminderPickerProps = {
  value: ReminderTime;
  onChange: (value: ReminderTime) => void;
  disabled?: boolean;
  presetsTitle: string;
  morningLabel: string;
  afternoonLabel: string;
  eveningLabel: string;
  changeTimeLabel: string;
  hint: string;
  timeAccessibilityLabel: string;
};

export function CheckInReminderPicker({
  value,
  onChange,
  disabled = false,
  presetsTitle,
  morningLabel,
  afternoonLabel,
  eveningLabel,
  changeTimeLabel,
  hint,
  timeAccessibilityLabel,
}: CheckInReminderPickerProps) {
  const brandAccentColor = useThemeColor({}, 'brandAccent');
  const brandAccentSoft = useThemeColor({}, 'brandAccentSoft');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');

  const presetLabels: Record<CheckInReminderPresetId, string> = {
    morning: morningLabel,
    afternoon: afternoonLabel,
    evening: eveningLabel,
  };

  const selectedPresetId = findMatchingReminderPreset(value);

  const handlePresetSelect = (presetId: CheckInReminderPresetId) => {
    if (disabled) {
      return;
    }

    const preset = CHECK_IN_REMINDER_PRESETS.find((entry) => entry.id === presetId);
    if (!preset) {
      return;
    }

    if (process.env.EXPO_OS === 'ios') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    onChange(preset.time);
  };

  return (
    <View style={styles.container}>
      <TimePickerField
        accessibilityLabel={timeAccessibilityLabel}
        value={value}
        disabled={disabled}
        variant="hero"
        changeTimeLabel={changeTimeLabel}
        onChange={onChange}
      />

      <View style={styles.presetsSection}>
        <ThemedText
          lightColor={textSecondaryColor}
          darkColor={textSecondaryColor}
          style={styles.presetsTitle}>
          {presetsTitle}
        </ThemedText>

        <View accessibilityRole="radiogroup" style={styles.presets}>
          {CHECK_IN_REMINDER_PRESETS.map((preset) => {
            const label = presetLabels[preset.id];
            const isSelected = selectedPresetId === preset.id;

            return (
              <Pressable
                key={preset.id}
                accessibilityRole="radio"
                accessibilityState={{ selected: isSelected, disabled }}
                accessibilityLabel={`${label}, ${formatReminderTime(preset.time)}`}
                disabled={disabled}
                onPress={() => handlePresetSelect(preset.id)}
                style={({ pressed }) => [
                  styles.presetChip,
                  {
                    backgroundColor: isSelected ? brandAccentSoft : 'transparent',
                    borderColor: isSelected ? brandAccentColor : textSecondaryColor,
                    opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
                  },
                ]}>
                <ThemedText
                  type="defaultSemiBold"
                  lightColor={isSelected ? brandAccentColor : undefined}
                  darkColor={isSelected ? brandAccentColor : undefined}
                  style={styles.presetLabel}>
                  {label}
                </ThemedText>
                <ThemedText
                  lightColor={textSecondaryColor}
                  darkColor={textSecondaryColor}
                  style={styles.presetTime}>
                  {formatReminderTime(preset.time)}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>
      </View>

      <ThemedText
        lightColor={textSecondaryColor}
        darkColor={textSecondaryColor}
        style={styles.hint}>
        {hint}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'stretch',
    gap: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  presetsSection: {
    gap: Spacing.sm,
  },
  presetsTitle: {
    ...Typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    paddingHorizontal: Spacing.xs,
  },
  presets: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  presetChip: {
    flex: 1,
    minHeight: 72,
    borderRadius: Radius.lg,
    borderWidth: 1,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  presetLabel: {
    ...Typography.caption,
    fontWeight: '600',
    textAlign: 'center',
  },
  presetTime: {
    ...Typography.caption,
    textAlign: 'center',
  },
  hint: {
    ...Typography.body,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: Spacing.md,
  },
});
