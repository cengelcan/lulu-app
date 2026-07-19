import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { Radius } from '@/constants/theme';
import { AccessibilityTokens } from '@/constants/accessibility';

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
    width: AccessibilityTokens.minimumTouchTarget,
    height: AccessibilityTokens.minimumTouchTarget,
    borderRadius: Radius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
