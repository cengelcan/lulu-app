import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

type HeaderTextButtonProps = {
  accessibilityLabel: string;
  color: string;
  disabled?: boolean;
  label: string;
  onPress: () => void;
};

export function HeaderTextButton({
  accessibilityLabel,
  color,
  disabled = false,
  label,
  onPress,
}: HeaderTextButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { opacity: disabled ? 0.4 : pressed ? 0.6 : 1 },
      ]}>
      <ThemedText lightColor={color} darkColor={color} type="defaultSemiBold" numberOfLines={1}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignSelf: 'flex-end',
    justifyContent: 'center',
    minHeight: 36,
    paddingHorizontal: Spacing.sm,
  },
});
