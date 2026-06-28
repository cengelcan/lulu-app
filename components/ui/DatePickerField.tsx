import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IOS_PICKER_HEIGHT, IOS_PICKER_WIDTH, IosPickerSheet } from '@/components/ui/IosPickerSheet';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/use-translation';
import { formatCheckInTitleDate, formatFullTitleDate, formatLocalDate, getTodayStart, parseLocalDate } from '@/utils/date';
import { getLocaleTag } from '@/utils/locale';

type DatePickerFieldProps = {
  accessibilityLabel: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  /** Defaults to today. Pass `null` to allow any future date. */
  maximumDate?: Date | null;
  minimumDate?: Date | null;
  /** `full` includes the year, e.g. "Saturday, 28 Jun 2026". */
  displayFormat?: 'short' | 'full';
};

function getPickerDate(value: string): Date {
  return parseLocalDate(value) ?? getTodayStart();
}

function formatDisplayValue(
  value: string,
  placeholder: string,
  displayFormat: 'short' | 'full',
  locale?: string
): string {
  if (!value.trim()) {
    return placeholder;
  }

  return displayFormat === 'full'
    ? formatFullTitleDate(value, locale)
    : formatCheckInTitleDate(value, locale);
}

export function DatePickerField({
  accessibilityLabel,
  value,
  onChange,
  disabled = false,
  placeholder = 'Select date',
  maximumDate = getTodayStart(),
  minimumDate = null,
  displayFormat = 'short',
}: DatePickerFieldProps) {
  const { language } = useTranslation();
  const locale = getLocaleTag(language);
  const [showPicker, setShowPicker] = useState(false);
  const [pickerDate, setPickerDate] = useState(() => getPickerDate(value));

  const textColor = useThemeColor({}, 'text');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const borderColor = useThemeColor({}, 'border');
  const surfaceColor = useThemeColor({}, 'surface');
  const backgroundColor = useThemeColor({}, 'background');

  const hasValue = value.trim().length > 0;
  const displayValue = formatDisplayValue(value, placeholder, displayFormat, locale);

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
        <IosPickerSheet
          visible={showPicker}
          title="Select Date"
          leftAction={{ label: 'Clear', onPress: handleClear }}
          onClose={closePicker}
          onDone={handleIosDone}>
          <DateTimePicker
            display="spinner"
            maximumDate={maximumDate ?? undefined}
            minimumDate={minimumDate ?? undefined}
            mode="date"
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
});
