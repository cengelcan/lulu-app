import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { TimePickerField } from '@/components/ui/TimePickerField';
import {
  CHECK_IN_REMINDER_PRESETS,
  findMatchingReminderPreset,
  type CheckInReminderPresetId,
} from '@/constants/reminder';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import type { ReminderTime } from '@/types/reminder';
import { formatReminderTime12h } from '@/utils/time';

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

const PRESET_ICONS: Record<CheckInReminderPresetId, IconSymbolName> = {
  morning: 'sun.max.fill',
  afternoon: 'cloud.sun.fill',
  evening: 'moon.fill',
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
  const brandAccentGlow = useThemeColor({}, 'brandAccentGlow');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const surfaceElevatedColor = useThemeColor({}, 'surfaceElevated');
  const borderColor = useThemeColor({}, 'border');

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
        variant="dial"
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
                accessibilityLabel={`${label}, ${formatReminderTime12h(preset.time)}`}
                disabled={disabled}
                onPress={() => handlePresetSelect(preset.id)}
                style={({ pressed }) => [
                  styles.presetCard,
                  {
                    backgroundColor: isSelected ? brandAccentSoft : surfaceElevatedColor,
                    borderColor: isSelected ? brandAccentColor : borderColor,
                    opacity: disabled ? 0.5 : pressed ? 0.88 : 1,
                    shadowColor: isSelected ? brandAccentGlow : 'transparent',
                    shadowOpacity: isSelected ? 0.9 : 0,
                    shadowRadius: isSelected ? 12 : 0,
                    shadowOffset: { width: 0, height: 0 },
                    elevation: isSelected ? 4 : 0,
                  },
                ]}>
                <IconSymbol
                  name={PRESET_ICONS[preset.id]}
                  size={18}
                  color={isSelected ? brandAccentColor : textSecondaryColor}
                />
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
                  {formatReminderTime12h(preset.time)}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={[styles.hintBanner, { backgroundColor: surfaceElevatedColor, borderColor }]}>
        <IconSymbol name="sparkles" size={16} color={brandAccentColor} />
        <ThemedText
          lightColor={textSecondaryColor}
          darkColor={textSecondaryColor}
          style={styles.hint}>
          {hint}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'stretch',
    gap: Spacing.lg,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.md,
  },
  presetsSection: {
    gap: Spacing.sm,
  },
  presetsTitle: {
    ...Typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    paddingHorizontal: Spacing.xs,
    fontWeight: '600',
  },
  presets: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  presetCard: {
    flex: 1,
    minHeight: 96,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
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
  hintBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  hint: {
    ...Typography.body,
    flex: 1,
    lineHeight: 22,
  },
});
