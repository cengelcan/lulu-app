import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

type SelectableOptionProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
};

export function SelectableOption({ label, selected, onPress, disabled = false }: SelectableOptionProps) {
  const primaryColor = useThemeColor({}, 'primary');
  const primaryTextColor = useThemeColor({}, 'primaryText');
  const borderColor = useThemeColor({}, 'border');
  const surfaceColor = useThemeColor({}, 'surface');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');

  const handlePress = () => {
    if (disabled) {
      return;
    }

    if (process.env.EXPO_OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.option,
        {
          backgroundColor: selected ? primaryColor : surfaceColor,
          borderColor: selected ? primaryColor : borderColor,
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
        },
      ]}>
      <ThemedText
        type="defaultSemiBold"
        lightColor={selected ? primaryTextColor : undefined}
        darkColor={selected ? primaryTextColor : undefined}
        style={styles.label}>
        {label}
      </ThemedText>
      {selected ? (
        <ThemedText lightColor={primaryTextColor} darkColor={primaryTextColor} style={styles.checkmark}>
          ✓
        </ThemedText>
      ) : (
        <ThemedText lightColor={textSecondaryColor} darkColor={textSecondaryColor} style={styles.checkmark}>
          {' '}
        </ThemedText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  option: {
    minHeight: 52,
    borderRadius: Radius.lg,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    ...Typography.bodySemiBold,
    flex: 1,
  },
  checkmark: {
    fontSize: 18,
    lineHeight: 22,
    marginLeft: Spacing.sm,
  },
});
