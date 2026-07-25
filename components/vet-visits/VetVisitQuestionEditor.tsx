import { Pressable, StyleSheet, View } from 'react-native';

import { RecordTextField } from '@/components/records/RecordTextField';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Radius, Spacing } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/use-translation';

type Props = {
  index: number;
  value: string;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onChange: (value: string) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
};

export function VetVisitQuestionEditor({
  index, value, canMoveUp, canMoveDown, onChange, onMoveUp, onMoveDown, onRemove,
}: Props) {
  const { t } = useTranslation();
  const borderColor = useThemeColor({}, 'border');
  const secondary = useThemeColor({}, 'textSecondary');
  const alert = useThemeColor({}, 'alert');

  const action = (label: string, icon: 'arrow.up' | 'arrow.down' | 'xmark', onPress: () => void, disabled = false) => (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.action, { borderColor, opacity: disabled ? 0.3 : pressed ? 0.65 : 1 }]}>
      <IconSymbol name={icon} size={18} color={icon === 'xmark' ? alert : secondary} />
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <RecordTextField
        label={t('vetVisits.questionLabel', { number: index + 1 })}
        value={value}
        onChangeText={onChange}
        placeholder={t('vetVisits.questionPlaceholder')}
        multiline
        maxLength={300}
      />
      <View style={styles.actions}>
        {action(t('vetVisits.moveUp'), 'arrow.up', onMoveUp, !canMoveUp)}
        {action(t('vetVisits.moveDown'), 'arrow.down', onMoveDown, !canMoveDown)}
        {action(t('vetVisits.removeQuestion'), 'xmark', onRemove)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.xs },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: Spacing.xs },
  action: {
    width: 40, height: 40, borderRadius: Radius.md, borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center', justifyContent: 'center',
  },
});
