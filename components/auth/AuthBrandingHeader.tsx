import { StyleSheet, View } from 'react-native';

import { LuluLogo } from '@/components/LuluLogo';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/use-translation';

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
      <LuluLogo
        accessibilityLabel={t('welcome.appName')}
        size={LOGO_SIZE}
        style={styles.logo}
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
