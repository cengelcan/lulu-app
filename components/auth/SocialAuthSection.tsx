import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Radius, Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/use-translation';

export function SocialAuthSection() {
  const { t } = useTranslation();
  const textColor = useThemeColor({}, 'text');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const surfaceColor = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'border');

  return (
    <View style={styles.section}>
      <View style={styles.dividerRow}>
        <View style={[styles.dividerLine, { backgroundColor: borderColor }]} />
        <Text allowFontScaling style={[styles.dividerText, { color: textSecondaryColor }]}>
          {t('auth.orDivider')}
        </Text>
        <View style={[styles.dividerLine, { backgroundColor: borderColor }]} />
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('auth.continueWithGoogle')}
        style={[styles.socialButton, { backgroundColor: surfaceColor, borderColor }]}>
        <Ionicons name="logo-google" size={20} color={textColor} />
        <Text allowFontScaling style={[styles.socialLabel, { color: textColor }]}>
          {t('auth.continueWithGoogle')}
        </Text>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('auth.continueWithApple')}
        style={[styles.socialButton, { backgroundColor: surfaceColor, borderColor }]}>
        <Ionicons name="logo-apple" size={22} color={textColor} />
        <Text allowFontScaling style={[styles.socialLabel, { color: textColor }]}>
          {t('auth.continueWithApple')}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.sm,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginVertical: Spacing.xs,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  dividerText: {
    ...Typography.caption,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    minHeight: 52,
    borderWidth: 1,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.lg,
  },
  socialLabel: {
    ...Typography.bodySemiBold,
  },
});
