import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, View } from 'react-native';

import { PetAvatar } from '@/components/pet/PetAvatar';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/use-translation';
import { formatCheckInTitleDate, formatLocalDate, getTodayStart, parseLocalDate } from '@/utils/date';
import { getLocaleTag } from '@/utils/locale';

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
  const [pickerDate, setPickerDate] = useState(() => parseLocalDate(selectedDate) ?? getTodayStart());

  const surfaceColor = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'border');
  const backgroundColor = useThemeColor({}, 'background');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');

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
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[styles.sheet, { backgroundColor: surfaceColor }]}
          onPress={(event) => event.stopPropagation()}>
          <View style={[styles.sheetHeader, { borderBottomColor: borderColor }]}>
            <Pressable accessibilityRole="button" hitSlop={8} onPress={onClose}>
              <ThemedText lightColor={textSecondaryColor} darkColor={textSecondaryColor}>
                Cancel
              </ThemedText>
            </Pressable>
            <ThemedText type="defaultSemiBold">Select Date</ThemedText>
            <Pressable accessibilityRole="button" hitSlop={8} onPress={handleIosDone}>
              <ThemedText type="defaultSemiBold">Done</ThemedText>
            </Pressable>
          </View>
          <DateTimePicker
            display="spinner"
            maximumDate={getTodayStart()}
            mode="date"
            themeVariant="dark"
            value={pickerDate}
            onChange={(_event, date) => {
              if (date) {
                setPickerDate(date);
              }
            }}
            style={{ backgroundColor }}
          />
          <View style={styles.sheetFooter}>
            <Button title="Done" onPress={handleIosDone} />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

type CheckInHeaderProps = {
  petName: string;
  petPhotoUri?: string | null;
  screenTitle: string;
  selectedDate: string;
  onOpenDatePicker: () => void;
};

export function CheckInHeader({
  petName,
  petPhotoUri,
  screenTitle,
  selectedDate,
  onOpenDatePicker,
}: CheckInHeaderProps) {
  const { language } = useTranslation();
  const brandAccentColor = useThemeColor({}, 'brandAccent');
  const backgroundColor = useThemeColor({}, 'background');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const locale = getLocaleTag(language);
  const formattedDate = formatCheckInTitleDate(selectedDate, locale);

  return (
    <View style={styles.container}>
      <View style={styles.avatarWrap}>
        <PetAvatar photoUri={petPhotoUri} size={72} />
        <View style={[styles.heartBadge, { backgroundColor: brandAccentColor, borderColor: backgroundColor }]}>
          <IconSymbol name="heart.fill" size={12} color="#FFFFFF" />
        </View>
      </View>

      <View style={styles.textBlock}>
        <ThemedText type="title" style={styles.title}>
          {screenTitle}
        </ThemedText>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${petName}, ${formattedDate}`}
          onPress={onOpenDatePicker}
          style={({ pressed }) => [styles.dateRow, { opacity: pressed ? 0.7 : 1 }]}>
          <ThemedText
            lightColor={textSecondaryColor}
            darkColor={textSecondaryColor}
            style={styles.dateText}>
            {formattedDate}
          </ThemedText>
          <IconSymbol name="chevron.down" size={16} color={textSecondaryColor} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: Spacing.md,
    paddingTop: Spacing.sm,
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
    alignItems: 'center',
    gap: Spacing.xs,
  },
  title: {
    textAlign: 'center',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xxs,
  },
  dateText: {
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
