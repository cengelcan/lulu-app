import { StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { CHECK_IN_NOTES_MAX_LENGTH } from '@/constants/check-in';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/use-translation';

type CheckInNotesSectionProps = {
  notes: string;
  isOverLimit: boolean;
  onChangeNotes: (value: string) => void;
};

export function CheckInNotesSection({
  notes,
  isOverLimit,
  onChangeNotes,
}: CheckInNotesSectionProps) {
  const { t } = useTranslation();

  const textColor = useThemeColor({}, 'text');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const surfaceColor = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'border');
  const primaryColor = useThemeColor({}, 'primary');
  const brandAccentColor = useThemeColor({}, 'brandAccent');

  return (
    <View style={styles.section}>
      <View style={styles.titleRow}>
        <IconSymbol name="doc.text.fill" size={18} color={brandAccentColor} />
        <ThemedText type="defaultSemiBold">{t('checkIn.notesTitle')}</ThemedText>
      </View>
      <View style={styles.inputWrap}>
        <TextInput
          accessibilityLabel={t('checkIn.notesTitle')}
          multiline
          placeholder={t('checkIn.notesPlaceholder')}
          placeholderTextColor={textSecondaryColor}
          style={[
            styles.input,
            {
              color: textColor,
              backgroundColor: surfaceColor,
              borderColor: isOverLimit ? primaryColor : borderColor,
            },
          ]}
          textAlignVertical="top"
          value={notes}
          onChangeText={onChangeNotes}
        />
        <View style={styles.pencilIcon} pointerEvents="none">
          <IconSymbol name="pencil" size={16} color={textSecondaryColor} />
        </View>
      </View>
      <ThemedText
        accessibilityLiveRegion="polite"
        accessibilityLabel={`${notes.length} of ${CHECK_IN_NOTES_MAX_LENGTH}`}
        lightColor={isOverLimit ? primaryColor : textSecondaryColor}
        darkColor={isOverLimit ? primaryColor : textSecondaryColor}
        style={styles.counter}>
        {notes.length} / {CHECK_IN_NOTES_MAX_LENGTH}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  inputWrap: {
    position: 'relative',
  },
  input: {
    ...Typography.body,
    borderWidth: 1,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    paddingRight: Spacing.xl,
    minHeight: 100,
  },
  pencilIcon: {
    position: 'absolute',
    right: Spacing.md,
    bottom: Spacing.md,
  },
  counter: {
    ...Typography.caption,
    textAlign: 'right',
  },
});
