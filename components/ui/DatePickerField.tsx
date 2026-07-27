import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IOS_PICKER_HEIGHT, IosPickerSheet } from '@/components/ui/IosPickerSheet';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRegionalFormat } from '@/hooks/use-regional-format';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/use-translation';
import { formatLocalDate, getTodayStart, parseLocalDate } from '@/utils/date';
import { formatWeekdayDate } from '@/utils/formatters';
import type { RegionalFormatContext } from '@/utils/regional-format';

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
  regionalFormat: RegionalFormatContext
): string {
  if (!value.trim()) {
    return placeholder;
  }

  return formatWeekdayDate(value, regionalFormat, displayFormat === 'full');
}

export function DatePickerField({
  accessibilityLabel,
  value,
  onChange,
  disabled = false,
  placeholder,
  maximumDate = getTodayStart(),
  minimumDate = null,
  displayFormat = 'short',
}: DatePickerFieldProps) {
  const { t } = useTranslation();
  const regionalFormat = useRegionalFormat();
  const [showPicker, setShowPicker] = useState(false);
  const [pickerDate, setPickerDate] = useState(() => getPickerDate(value));

  const textColor = useThemeColor({}, 'text');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const borderColor = useThemeColor({}, 'border');
  const surfaceColor = useThemeColor({}, 'surface');
  const backgroundColor = useThemeColor({}, 'background');
  const colorScheme = useColorScheme();

  const hasValue = value.trim().length > 0;
  const resolvedPlaceholder = placeholder ?? t('common.selectDate');
  const displayValue = formatDisplayValue(
    value,
    resolvedPlaceholder,
    displayFormat,
    regionalFormat
  );

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
          title={t('common.selectDate')}
          leftAction={{ label: t('common.clear'), onPress: handleClear }}
          onClose={closePicker}
          onDone={handleIosDone}>
          <DateTimePicker
            display="spinner"
            maximumDate={maximumDate ?? undefined}
            minimumDate={minimumDate ?? undefined}
            mode="date"
            themeVariant={colorScheme}
            value={pickerDate}
            onChange={handleIosChange}
            style={{ width: '100%', height: IOS_PICKER_HEIGHT, backgroundColor }}
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
