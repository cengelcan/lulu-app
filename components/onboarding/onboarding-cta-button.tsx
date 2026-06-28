import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { BrandGradientFill } from '@/components/ui/BrandGradient';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';

type OnboardingCtaButtonProps = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function OnboardingCtaButton({ title, onPress, disabled = false, style }: OnboardingCtaButtonProps) {
  const handlePress = () => {
    if (process.env.EXPO_OS === 'ios' && !disabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      disabled={disabled}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.base,
        {
          opacity: disabled ? 0.45 : pressed ? 0.88 : 1,
        },
        style,
      ]}>
      <BrandGradientFill />
      <Text
        allowFontScaling
        maxFontSizeMultiplier={Typography.button.maxFontSizeMultiplier}
        style={styles.label}>
        {title}
      </Text>
      <View style={styles.iconSlot}>
        <IconSymbol name="chevron.right" size={18} color={Palette.onDark} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 56,
    borderRadius: Radius.pill,
    overflow: 'hidden',
    paddingHorizontal: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...Typography.button,
    color: Palette.onDark,
    textAlign: 'center',
    flex: 1,
  },
  iconSlot: {
    position: 'absolute',
    right: Spacing.lg,
  },
});
