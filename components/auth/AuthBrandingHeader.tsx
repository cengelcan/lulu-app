import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/use-translation';

const LULU_LOGO = require('@/assets/images/lulu-logo-transparent.png');
const LOGO_SIZE = 132;

type AuthBrandingHeaderProps = {
  title: string;
  subtitle: string;
};

export function AuthBrandingHeader({ title, subtitle }: AuthBrandingHeaderProps) {
  const { t } = useTranslation();
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const brandAccentColor = useThemeColor({}, 'brandAccent');

  return (
    <View style={styles.container}>
      <Image
        accessibilityLabel={t('welcome.appName')}
        source={LULU_LOGO}
        style={styles.logo}
        contentFit="contain"
      />

      <View style={styles.titleRow}>
        <ThemedText accessibilityRole="header" type="title" style={styles.title}>
          {title}
        </ThemedText>
        <IconSymbol name="pawprint.fill" size={22} color={brandAccentColor} />
      </View>

      <ThemedText
        lightColor={textSecondaryColor}
        darkColor={textSecondaryColor}
        style={styles.subtitle}>
        {subtitle}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    backgroundColor: 'transparent',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    ...Typography.body,
    textAlign: 'center',
  },
});
