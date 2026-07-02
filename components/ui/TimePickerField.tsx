import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';
import { useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { IOS_PICKER_HEIGHT, IOS_PICKER_WIDTH, IosPickerSheet } from '@/components/ui/IosPickerSheet';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/use-translation';
import type { ReminderTime } from '@/types/reminder';
import {
  formatReminderTime,
  formatReminderTime12h,
  getReminderDialArcDots,
  getReminderDialKnobPosition,
  reminderTimeFromDate,
  reminderTimeToDate,
} from '@/utils/time';

type TimePickerFieldProps = {
  accessibilityLabel: string;
  value: ReminderTime;
  onChange: (value: ReminderTime) => void;
  disabled?: boolean;
  variant?: 'field' | 'row' | 'hero' | 'dial';
  label?: string;
  changeTimeLabel?: string;
  isLast?: boolean;
};

const DIAL_SIZE = 220;
const DIAL_RADIUS = 92;
const DIAL_CENTER = DIAL_SIZE / 2;

export function TimePickerField({
  accessibilityLabel,
  value,
  onChange,
  disabled = false,
  variant = 'field',
  label,
  changeTimeLabel,
  isLast = false,
}: TimePickerFieldProps) {
  const { t } = useTranslation();
  const [showPicker, setShowPicker] = useState(false);
  const [pickerDate, setPickerDate] = useState(() => reminderTimeToDate(value));

  const textColor = useThemeColor({}, 'text');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const borderColor = useThemeColor({}, 'border');
  const surfaceColor = useThemeColor({}, 'surface');
  const backgroundColor = useThemeColor({}, 'background');
  const brandAccentColor = useThemeColor({}, 'brandAccent');
  const brandAccentSoft = useThemeColor({}, 'brandAccentSoft');

  const displayValue = variant === 'dial' ? formatReminderTime12h(value) : formatReminderTime(value);
  const arcDots = useMemo(
    () => (variant === 'dial' ? getReminderDialArcDots(value, DIAL_RADIUS, DIAL_CENTER) : []),
    [value, variant]
  );
  const knobPosition = useMemo(
    () => (variant === 'dial' ? getReminderDialKnobPosition(value, DIAL_RADIUS, DIAL_CENTER) : { left: 0, top: 0 }),
    [value, variant]
  );

  const openPicker = () => {
    if (disabled) {
      return;
    }

    if (process.env.EXPO_OS === 'ios') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    setPickerDate(reminderTimeToDate(value));
    setShowPicker(true);
  };

  const closePicker = () => {
    setShowPicker(false);
  };

  const handleAndroidChange = (event: DateTimePickerEvent, date?: Date) => {
    setShowPicker(false);

    if (event.type === 'dismissed' || !date) {
      return;
    }

    onChange(reminderTimeFromDate(date));
  };

  const handleIosChange = (_event: DateTimePickerEvent, date?: Date) => {
    if (date) {
      setPickerDate(date);
    }
  };

  const handleIosDone = () => {
    onChange(reminderTimeFromDate(pickerDate));
    closePicker();
  };

  return (
    <>
      {variant === 'dial' ? (
        <Pressable
          accessibilityLabel={accessibilityLabel}
          accessibilityRole="button"
          accessibilityState={{ disabled }}
          disabled={disabled}
          onPress={openPicker}
          style={({ pressed }) => [
            styles.dialCard,
            {
              backgroundColor: surfaceColor,
              borderColor,
              opacity: disabled ? 0.5 : pressed ? 0.92 : 1,
            },
          ]}>
          <View style={styles.dialStage}>
            <View
              style={[
                styles.dialRing,
                {
                  borderColor: `${textSecondaryColor}55`,
                },
              ]}
            />
            {arcDots.map((dot, index) => (
              <View
                key={index}
                style={[
                  styles.dialArcDot,
                  {
                    left: dot.left,
                    top: dot.top,
                    backgroundColor: brandAccentColor,
                  },
                ]}
              />
            ))}
            <View
              style={[
                styles.dialKnob,
                {
                  left: knobPosition.left,
                  top: knobPosition.top,
                  backgroundColor: brandAccentColor,
                  shadowColor: Palette.brandAccentGlow,
                },
              ]}
            />

            <View style={styles.dialSun}>
              <IconSymbol name="sun.max.fill" size={16} color={textSecondaryColor} />
            </View>
            <View style={styles.dialMoon}>
              <IconSymbol name="moon.fill" size={16} color={textSecondaryColor} />
            </View>

            <View style={styles.dialCenter}>
              <View style={[styles.dialBell, { backgroundColor: brandAccentSoft }]}>
                <IconSymbol name="bell.fill" size={18} color={brandAccentColor} />
              </View>
              <ThemedText type="title" style={styles.dialTime}>
                {displayValue}
              </ThemedText>
              {changeTimeLabel ? (
                <ThemedText
                  lightColor={textSecondaryColor}
                  darkColor={textSecondaryColor}
                  style={styles.dialHint}>
                  {changeTimeLabel}
                </ThemedText>
              ) : null}
            </View>
          </View>
        </Pressable>
      ) : variant === 'hero' ? (
        <Pressable
          accessibilityLabel={accessibilityLabel}
          accessibilityRole="button"
          accessibilityState={{ disabled }}
          disabled={disabled}
          onPress={openPicker}
          style={({ pressed }) => [
            styles.hero,
            { opacity: disabled ? 0.5 : pressed ? 0.88 : 1 },
          ]}>
          <View style={[styles.heroIconCircle, { backgroundColor: brandAccentSoft }]}>
            <IconSymbol name="bell.fill" size={28} color={brandAccentColor} />
          </View>
          <ThemedText type="title" style={styles.heroTime}>
            {displayValue}
          </ThemedText>
          {changeTimeLabel ? (
            <ThemedText
              lightColor={textSecondaryColor}
              darkColor={textSecondaryColor}
              style={styles.heroHint}>
              {changeTimeLabel}
            </ThemedText>
          ) : null}
        </Pressable>
      ) : variant === 'row' ? (
        <Pressable
          accessibilityLabel={accessibilityLabel}
          accessibilityRole="button"
          accessibilityState={{ disabled }}
          disabled={disabled}
          onPress={openPicker}
          style={({ pressed }) => [
            styles.row,
            !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: borderColor },
            { opacity: disabled ? 0.5 : pressed ? 0.7 : 1 },
          ]}>
          <ThemedText type="defaultSemiBold" style={styles.rowLabel}>
            {label}
          </ThemedText>
          <ThemedText
            lightColor={textSecondaryColor}
            darkColor={textSecondaryColor}
            style={styles.rowValue}>
            {displayValue}
          </ThemedText>
          <IconSymbol name="chevron.right" size={16} color={textSecondaryColor} />
        </Pressable>
      ) : (
        <Pressable
          accessibilityLabel={accessibilityLabel}
          accessibilityRole="button"
          accessibilityState={{ disabled }}
          disabled={disabled}
          onPress={openPicker}
          style={({ pressed }) => [
            styles.field,
            {
              backgroundColor: surfaceColor,
              borderColor,
              opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
            },
          ]}>
          <ThemedText lightColor={textColor} darkColor={textColor} style={styles.value}>
            {displayValue}
          </ThemedText>
        </Pressable>
      )}

      {Platform.OS === 'android' && showPicker ? (
        <DateTimePicker
          display="default"
          mode="time"
          value={pickerDate}
          onChange={handleAndroidChange}
        />
      ) : null}

      {Platform.OS === 'ios' ? (
        <IosPickerSheet
          visible={showPicker}
          title={t('common.selectTime')}
          onClose={closePicker}
          onDone={handleIosDone}>
          <DateTimePicker
            display="spinner"
            mode="time"
            themeVariant="dark"
            value={pickerDate}
            onChange={handleIosChange}
            style={{ width: IOS_PICKER_WIDTH, height: IOS_PICKER_HEIGHT, backgroundColor }}
          />
        </IosPickerSheet>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  dialCard: {
    borderRadius: Radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
  },
  dialStage: {
    width: DIAL_SIZE,
    height: DIAL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialRing: {
    position: 'absolute',
    width: DIAL_RADIUS * 2,
    height: DIAL_RADIUS * 2,
    borderRadius: DIAL_RADIUS,
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  dialArcDot: {
    position: 'absolute',
    width: 5,
    height: 5,
    borderRadius: Radius.full,
  },
  dialKnob: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: Radius.full,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 4,
  },
  dialSun: {
    position: 'absolute',
    left: 18,
    bottom: 18,
  },
  dialMoon: {
    position: 'absolute',
    right: 18,
    bottom: 18,
  },
  dialCenter: {
    alignItems: 'center',
    gap: Spacing.xxs,
    maxWidth: 150,
  },
  dialBell: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xxs,
  },
  dialTime: {
    fontSize: 32,
    lineHeight: 38,
    textAlign: 'center',
  },
  dialHint: {
    ...Typography.caption,
    textAlign: 'center',
  },
  hero: {
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
  },
  heroIconCircle: {
    width: 72,
    height: 72,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  heroTime: {
    textAlign: 'center',
  },
  heroHint: {
    ...Typography.caption,
    textAlign: 'center',
  },
  field: {
    minHeight: 52,
    borderWidth: 1,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    justifyContent: 'center',
  },
  value: {
    ...Typography.body,
  },
  row: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
  },
  rowLabel: {
    ...Typography.body,
    flex: 1,
  },
  rowValue: {
    ...Typography.body,
  },
});
