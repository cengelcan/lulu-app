import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { Radius } from '@/constants/theme';

type HeaderIconButtonProps = {
  accessibilityLabel: string;
  borderColor: string;
  children: React.ReactNode;
  disabled?: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
};

export function HeaderIconButton({
  accessibilityLabel,
  borderColor,
  children,
  disabled = false,
  onPress,
  style,
}: HeaderIconButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      disabled={disabled}
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { borderColor, opacity: disabled ? 0.35 : pressed ? 0.7 : 1 },
        style,
      ]}>
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
