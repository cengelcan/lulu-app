import { Pressable, StyleSheet, Text } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/use-translation';

type ContinueWithEmailButtonProps = {
  onPress: () => void;
  selected?: boolean;
  disabled?: boolean;
};

export function ContinueWithEmailButton({
  onPress,
  selected = false,
  disabled = false,
}: ContinueWithEmailButtonProps) {
  const { t } = useTranslation();
  const brandAccentColor = useThemeColor({}, 'brandAccent');

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('auth.continueWithEmail')}
      accessibilityState={{ selected }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          borderColor: brandAccentColor,
          backgroundColor: selected ? Palette.brandAccentSoft : 'transparent',
          opacity: disabled ? 0.45 : pressed ? 0.85 : 1,
        },
      ]}>
      <IconSymbol name="envelope.fill" size={20} color={brandAccentColor} />
      <Text allowFontScaling style={[styles.label, { color: brandAccentColor }]}>
        {t('auth.continueWithEmail')}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    minHeight: 52,
    borderWidth: 1,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.lg,
  },
  label: {
    ...Typography.bodySemiBold,
  },
});
