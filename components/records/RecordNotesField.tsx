import { StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/use-translation';
import { PET_RECORD_NOTES_MAX_LENGTH } from '@/types/pet-record';

type RecordNotesFieldProps = {
  value: string;
  onChangeText: (value: string) => void;
  isOverLimit: boolean;
};

export function RecordNotesField({ value, onChangeText, isOverLimit }: RecordNotesFieldProps) {
  const { t } = useTranslation();
  const textColor = useThemeColor({}, 'text');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const surfaceColor = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'border');
  const alertColor = useThemeColor({}, 'alert');

  return (
    <View style={styles.field}>
      <View style={styles.labelRow}>
        <ThemedText type="defaultSemiBold">{t('records.fields.notes')}</ThemedText>
        <ThemedText
          lightColor={textSecondaryColor}
          darkColor={textSecondaryColor}
          style={styles.optional}>
          {t('common.optional')}
        </ThemedText>
      </View>
      <TextInput
        accessibilityLabel={t('records.fields.notes')}
        multiline
        placeholder={t('records.fields.notesPlaceholder')}
        placeholderTextColor={textSecondaryColor}
        style={[
          styles.input,
          {
            color: textColor,
            backgroundColor: surfaceColor,
            borderColor: isOverLimit ? alertColor : borderColor,
          },
        ]}
        textAlignVertical="top"
        value={value}
        onChangeText={onChangeText}
      />
      <ThemedText
        accessibilityLiveRegion={isOverLimit ? 'assertive' : undefined}
        lightColor={isOverLimit ? alertColor : textSecondaryColor}
        darkColor={isOverLimit ? alertColor : textSecondaryColor}
        selectable
        style={styles.counter}>
        {value.length} / {PET_RECORD_NOTES_MAX_LENGTH}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: Spacing.xs,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  optional: {
    ...Typography.caption,
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
