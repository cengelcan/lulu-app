import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Palette, Radius, Spacing, Typography } from '@/constants/theme';
import { useTranslation } from '@/hooks/use-translation';

export function SocialAuthSection() {
  const { t } = useTranslation();

  return (
    <View style={styles.section}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('auth.continueWithApple')}
        style={({ pressed }) => [styles.socialButton, { opacity: pressed ? 0.85 : 1 }]}>
        <Ionicons name="logo-apple" size={22} color={Palette.ink} />
        <Text allowFontScaling style={styles.socialLabel}>
          {t('auth.continueWithApple')}
        </Text>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('auth.continueWithGoogle')}
        style={({ pressed }) => [styles.socialButton, { opacity: pressed ? 0.85 : 1 }]}>
        <Ionicons name="logo-google" size={20} color={Palette.ink} />
        <Text allowFontScaling style={styles.socialLabel}>
          {t('auth.continueWithGoogle')}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.sm,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    minHeight: 52,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Palette.canvas,
  },
  socialLabel: {
    ...Typography.bodySemiBold,
    color: Palette.ink,
  },
});
