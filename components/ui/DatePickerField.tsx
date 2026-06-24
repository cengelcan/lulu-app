import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { formatCheckInTitleDate, formatLocalDate, getTodayStart, parseLocalDate } from '@/utils/date';

type DatePickerFieldProps = {
  accessibilityLabel: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  /** Defaults to today. Pass `null` to allow any future date. */
  maximumDate?: Date | null;
  minimumDate?: Date | null;
};

function getPickerDate(value: string): Date {
  return parseLocalDate(value) ?? getTodayStart();
}

function formatDisplayValue(value: string, placeholder: string): string {
  if (!value.trim()) {
    return placeholder;
  }

  return formatCheckInTitleDate(value);
}

export function DatePickerField({
  accessibilityLabel,
  value,
  onChange,
  disabled = false,
  placeholder = 'Select date',
  maximumDate = getTodayStart(),
  minimumDate = null,
}: DatePickerFieldProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [pickerDate, setPickerDate] = useState(() => getPickerDate(value));

  const textColor = useThemeColor({}, 'text');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const borderColor = useThemeColor({}, 'border');
  const surfaceColor = useThemeColor({}, 'surface');
  const backgroundColor = useThemeColor({}, 'background');

  const hasValue = value.trim().length > 0;
  const displayValue = formatDisplayValue(value, placeholder);

  const openPicker = () => {
    if (disabled) {
      return;
    }

    setPickerDate(getPickerDate(value));
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

    onChange(formatLocalDate(date));
  };

  const handleIosChange = (_event: DateTimePickerEvent, date?: Date) => {
    if (date) {
      setPickerDate(date);
    }
  };

  const handleIosDone = () => {
    onChange(formatLocalDate(pickerDate));
    closePicker();
  };

  const handleClear = () => {
    onChange('');
    closePicker();
  };

  return (
    <>
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
        <ThemedText
          lightColor={hasValue ? textColor : textSecondaryColor}
          darkColor={hasValue ? textColor : textSecondaryColor}
          style={styles.value}>
          {displayValue}
        </ThemedText>
      </Pressable>

      {Platform.OS === 'android' && showPicker ? (
        <DateTimePicker
          display="default"
          maximumDate={maximumDate ?? undefined}
          minimumDate={minimumDate ?? undefined}
          mode="date"
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
                <Pressable accessibilityRole="button" hitSlop={8} onPress={handleClear}>
                  <ThemedText lightColor={textSecondaryColor} darkColor={textSecondaryColor}>
                    Clear
                  </ThemedText>
                </Pressable>
                <ThemedText type="defaultSemiBold">Select Date</ThemedText>
                <Pressable accessibilityRole="button" hitSlop={8} onPress={handleIosDone}>
                  <ThemedText type="defaultSemiBold">Done</ThemedText>
                </Pressable>
              </View>
              <DateTimePicker
                display="spinner"
                maximumDate={maximumDate ?? undefined}
                minimumDate={minimumDate ?? undefined}
                mode="date"
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
  sheetFooter: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
  },
});
