import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { PetAvatar } from '@/components/pet/PetAvatar';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { IOS_PICKER_HEIGHT, IosPickerSheet } from '@/components/ui/IosPickerSheet';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { useCheckInTheme } from '@/hooks/use-check-in-theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRegionalFormat } from '@/hooks/use-regional-format';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/use-translation';
import { formatLocalDate, getTodayStart, parseLocalDate } from '@/utils/date';
import { formatWeekdayDate } from '@/utils/formatters';
import type { PetSpecies } from '@/types/pet';

type CheckInDatePickerProps = {
  selectedDate: string;
  onDateChange: (date: string) => void;
  disabled?: boolean;
  visible: boolean;
  onClose: () => void;
};

export function CheckInDatePicker({
  selectedDate,
  onDateChange,
  disabled = false,
  visible,
  onClose,
}: CheckInDatePickerProps) {
  const { t } = useTranslation();
  const [pickerDate, setPickerDate] = useState(() => parseLocalDate(selectedDate) ?? getTodayStart());

  const backgroundColor = useThemeColor({}, 'background');
  const colorScheme = useColorScheme();

  const handleAndroidChange = (event: DateTimePickerEvent, date?: Date) => {
    onClose();

    if (event.type === 'dismissed' || !date) {
      return;
    }

    onDateChange(formatLocalDate(date));
  };

  const handleIosDone = () => {
    onDateChange(formatLocalDate(pickerDate));
    onClose();
  };

  if (!visible || disabled) {
    return null;
  }

  if (Platform.OS === 'android') {
    return (
      <DateTimePicker
        display="default"
        maximumDate={getTodayStart()}
        mode="date"
        value={parseLocalDate(selectedDate) ?? getTodayStart()}
        onChange={handleAndroidChange}
      />
    );
  }

  return (
    <IosPickerSheet
      visible={visible}
      title={t('common.selectDate')}
      leftAction={{ label: t('common.cancel'), onPress: onClose }}
      onClose={onClose}
      onDone={handleIosDone}>
      <DateTimePicker
        display="spinner"
        maximumDate={getTodayStart()}
        mode="date"
        themeVariant={colorScheme}
        value={pickerDate}
        onChange={(_event, date) => {
          if (date) {
            setPickerDate(date);
          }
        }}
        style={{ width: '100%', height: IOS_PICKER_HEIGHT, backgroundColor }}
      />
    </IosPickerSheet>
  );
}

type CheckInHeaderProps = {
  petName: string;
  petPhotoUri?: string | null;
  petSpecies?: PetSpecies | null;
  screenTitle: string;
  selectedDate: string;
  onOpenDatePicker: () => void;
};

export function CheckInHeader({
  petName,
  petPhotoUri,
  petSpecies,
  screenTitle,
  selectedDate,
  onOpenDatePicker,
}: CheckInHeaderProps) {
  const regionalFormat = useRegionalFormat();
  const checkInTheme = useCheckInTheme();
  const formattedDate = formatWeekdayDate(selectedDate, regionalFormat);

  return (
    <View style={styles.container}>
      <View style={styles.avatarWrap}>
        <PetAvatar
          accentBorder
          accentColor={checkInTheme.accent}
          photoUri={petPhotoUri}
          species={petSpecies}
          size={72}
        />
        <View
          style={[
            styles.heartBadge,
            {
              backgroundColor: checkInTheme.accent,
              borderColor: checkInTheme.background,
            },
          ]}>
          <IconSymbol name="heart.fill" size={12} color="#FFFFFF" />
        </View>
      </View>

      <View style={styles.textBlock}>
        <View style={styles.titleRow}>
          <ThemedText type="defaultSemiBold" style={styles.title}>
            {screenTitle}
          </ThemedText>
          <IconSymbol name="pawprint.fill" size={14} color={checkInTheme.accent} />
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${petName}, ${formattedDate}`}
          onPress={onOpenDatePicker}
          style={({ pressed }) => [styles.dateRow, { opacity: pressed ? 0.7 : 1 }]}>
          <ThemedText
            lightColor={checkInTheme.textMuted}
            darkColor={checkInTheme.textMuted}
            style={styles.dateText}>
            {formattedDate}
          </ThemedText>
          <IconSymbol name="chevron.down" size={14} color={checkInTheme.textMuted} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingTop: Spacing.xs,
  },
  avatarWrap: {
    position: 'relative',
  },
  heartBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 24,
    height: 24,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  textBlock: {
    flex: 1,
    gap: Spacing.xxs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.xxs,
  },
  title: {
    ...Typography.subtitle,
    flexShrink: 1,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xxs,
  },
  dateText: {
    ...Typography.body,
  },
});
