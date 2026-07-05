import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text, View, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

import { BrandGradientFill } from '@/components/ui/BrandGradient';
import { Palette, Radius, Spacing, Typography, type ThemeColor } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';

type ButtonProps = Omit<PressableProps, 'style'> & {
  title: string;
  variant?: ButtonVariant;
  style?: StyleProp<ViewStyle>;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
};

const variantStyles: Record<
  ButtonVariant,
  {
    background?: ThemeColor;
    text: ThemeColor;
    bordered?: boolean;
    transparent?: boolean;
    gradient?: boolean;
  }
> = {
  primary: {
    gradient: true,
    text: 'primaryText',
  },
  secondary: {
    background: 'surfaceElevated',
    text: 'text',
    bordered: true,
  },
  ghost: {
    background: 'background',
    text: 'text',
    transparent: true,
  },
  destructive: {
    background: 'alert',
    text: 'primaryText',
  },
};

export function Button({
  title,
  variant = 'primary',
  disabled,
  style,
  leadingIcon,
  trailingIcon,
  onPress,
  ...rest
}: ButtonProps) {
  const tokens = variantStyles[variant];
  const backgroundColor = useThemeColor({}, tokens.background ?? 'background');
  const themeTextColor = useThemeColor({}, tokens.text);
  const textColor = tokens.gradient ? Palette.onDark : themeTextColor;
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
        tokens.gradient && styles.gradient,
        tokens.bordered && styles.bordered,
        {
          backgroundColor: tokens.gradient
            ? 'transparent'
            : tokens.transparent
              ? 'transparent'
              : backgroundColor,
          borderColor: tokens.bordered ? borderColor : undefined,
          opacity: disabled ? 0.45 : pressed ? 0.85 : 1,
        },
        style,
      ]}
      {...rest}>
      {tokens.gradient ? <BrandGradientFill /> : null}
      <View style={styles.content}>
        {leadingIcon}
        <Text
          allowFontScaling
          maxFontSizeMultiplier={Typography.button.maxFontSizeMultiplier}
          style={[styles.label, { color: textColor }]}>
          {title}
        </Text>
        {trailingIcon}
      </View>
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
  gradient: {
    overflow: 'hidden',
  },
  bordered: {
    borderWidth: 1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  label: {
    ...Typography.button,
  },
});
