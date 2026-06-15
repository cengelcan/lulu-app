import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

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
  const [expanded, setExpanded] = useState(notes.length > 0);

  const textColor = useThemeColor({}, 'text');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const surfaceColor = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'border');
  const primaryColor = useThemeColor({}, 'primary');

  if (!expanded) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={() => setExpanded(true)}
        style={({ pressed }) => [styles.expandRow, { opacity: pressed ? 0.7 : 1 }]}>
        <IconSymbol name="chevron.right" size={16} color={textSecondaryColor} />
        <ThemedText
          lightColor={textSecondaryColor}
          darkColor={textSecondaryColor}
          style={styles.expandLabel}>
          {t('checkIn.notesExpand')}
        </ThemedText>
      </Pressable>
    );
  }

  return (
    <View style={styles.section}>
      <Pressable
        accessibilityRole="button"
        onPress={() => setExpanded(false)}
        style={({ pressed }) => [styles.collapseRow, { opacity: pressed ? 0.7 : 1 }]}>
        <ThemedText type="subtitle">{t('checkIn.notesTitle')}</ThemedText>
        <ThemedText
          lightColor={textSecondaryColor}
          darkColor={textSecondaryColor}
          style={styles.collapseLabel}>
          {t('checkIn.notesCollapse')}
        </ThemedText>
      </Pressable>
      <ThemedText
        lightColor={textSecondaryColor}
        darkColor={textSecondaryColor}
        style={styles.subtitle}>
        {t('checkIn.notesSubtitle')}
      </ThemedText>
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
  expandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
  },
  expandLabel: {
    ...Typography.body,
  },
  section: {
    gap: Spacing.sm,
  },
  collapseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  collapseLabel: {
    ...Typography.caption,
  },
  subtitle: {
    ...Typography.body,
  },
  input: {
    ...Typography.body,
    borderWidth: 1,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    minHeight: 120,
  },
  counter: {
    ...Typography.caption,
    textAlign: 'right',
  },
});
