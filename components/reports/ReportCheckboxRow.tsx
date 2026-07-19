import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { AccessibilityTokens } from '@/constants/accessibility';
import { Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

type ReportCheckboxRowProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  isLast?: boolean;
};

export function ReportCheckboxRow({
  label,
  selected,
  onPress,
  isLast = false,
}: ReportCheckboxRowProps) {
  const accentColor = useThemeColor({}, 'accent');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const borderColor = useThemeColor({}, 'border');

  const handlePress = () => {
    if (process.env.EXPO_OS === 'ios') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityLabel={label}
      accessibilityState={{ checked: selected }}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.row,
        !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: borderColor },
        { opacity: pressed ? 0.7 : 1 },
      ]}>
      <IconSymbol
        name={selected ? 'checkmark.circle' : 'circle'}
        size={22}
        color={selected ? accentColor : textSecondaryColor}
      />
      <ThemedText type="defaultSemiBold" style={styles.label}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: AccessibilityTokens.comfortableTouchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  label: {
    ...Typography.body,
    flex: 1,
  },
});
