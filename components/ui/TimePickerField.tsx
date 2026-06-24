import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import type { ReminderTime } from '@/types/reminder';
import { formatReminderTime, reminderTimeFromDate, reminderTimeToDate } from '@/utils/time';

type TimePickerFieldProps = {
  accessibilityLabel: string;
  value: ReminderTime;
  onChange: (value: ReminderTime) => void;
  disabled?: boolean;
  variant?: 'field' | 'row';
  label?: string;
  isLast?: boolean;
};

export function TimePickerField({
  accessibilityLabel,
  value,
  onChange,
  disabled = false,
  variant = 'field',
  label,
  isLast = false,
}: TimePickerFieldProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [pickerDate, setPickerDate] = useState(() => reminderTimeToDate(value));

  const textColor = useThemeColor({}, 'text');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const borderColor = useThemeColor({}, 'border');
  const surfaceColor = useThemeColor({}, 'surface');
  const backgroundColor = useThemeColor({}, 'background');

  const displayValue = formatReminderTime(value);

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
      {variant === 'row' ? (
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
        <Modal animationType="slide" transparent visible={showPicker} onRequestClose={closePicker}>
          <Pressable style={styles.backdrop} onPress={closePicker}>
            <Pressable
              style={[styles.sheet, { backgroundColor: surfaceColor }]}
              onPress={(event) => event.stopPropagation()}>
              <View style={[styles.sheetHeader, { borderBottomColor: borderColor }]}>
                <View style={styles.headerSpacer} />
                <ThemedText type="defaultSemiBold">Select Time</ThemedText>
                <Pressable accessibilityRole="button" hitSlop={8} onPress={handleIosDone}>
                  <ThemedText type="defaultSemiBold">Done</ThemedText>
                </Pressable>
              </View>
              <DateTimePicker
                display="spinner"
                mode="time"
                themeVariant="dark"
                value={pickerDate}
                onChange={handleIosChange}
                style={{ backgroundColor }}
              />
              <View style={styles.sheetFooter}>
                <Button title="Done" onPress={handleIosDone} />
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
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
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  sheet: {
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    paddingBottom: Spacing.lg,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerSpacer: {
    width: 48,
  },
  sheetFooter: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
  },
});
