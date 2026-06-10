import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

import { Radius, Spacing, Typography, type ThemeColor } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';

type ButtonProps = Omit<PressableProps, 'style'> & {
  title: string;
  variant?: ButtonVariant;
  style?: StyleProp<ViewStyle>;
};

const variantStyles: Record<
  ButtonVariant,
  {
    background: ThemeColor;
    text: ThemeColor;
  }
> = {
  primary: {
    background: 'primary',
    text: 'primaryText',
  },
  secondary: {
    background: 'secondary',
    text: 'secondaryText',
  },
  ghost: {
    background: 'background',
    text: 'primary',
  },
  destructive: {
    background: 'alert',
    text: 'primaryText',
  },
};

export function Button({ title, variant = 'primary', disabled, style, onPress, ...rest }: ButtonProps) {
  const tokens = variantStyles[variant];
  const backgroundColor = useThemeColor({}, tokens.background);
  const textColor = useThemeColor({}, tokens.text);
  const borderColor = useThemeColor({}, 'border');

  const handlePress: PressableProps['onPress'] = (event) => {
    if (process.env.EXPO_OS === 'ios' && !disabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress?.(event);
  };

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.base,
        variant === 'ghost' && styles.ghost,
        {
          backgroundColor: variant === 'ghost' ? 'transparent' : backgroundColor,
          borderColor: variant === 'ghost' ? borderColor : undefined,
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
        },
        style,
      ]}
      {...rest}>
      <Text style={[styles.label, { color: textColor }]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghost: {
    borderWidth: 1,
  },
  label: {
    ...Typography.button,
  },
});
