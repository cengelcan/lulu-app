import { Image } from 'expo-image';
import { ActivityIndicator, Platform, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Fonts, Palette, Spacing, Typography } from '@/constants/theme';
import { useBootstrap } from '@/hooks/use-bootstrap';
import { useThemeColor } from '@/hooks/use-theme-color';

const SPLASH_BG = require('@/assets/images/splash-screen-bg.png');
const LULU_LOGO = require('@/assets/images/lulu-logo.png');

export default function SplashScreen() {
  const { phase, error, retry } = useBootstrap();
  const brandAccentColor = useThemeColor({}, 'brandAccent');
  const surfaceColor = useThemeColor({}, 'surface');

  const isLoading = phase === 'loading' || phase === 'redirecting';

  return (
    <View style={styles.root}>
      <Image
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        source={SPLASH_BG}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
      />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.branding}>
          <Image
            accessibilityLabel="Lulu"
            source={LULU_LOGO}
            style={styles.logo}
            contentFit="contain"
          />

          <Text allowFontScaling style={styles.appName}>
            Lulu
          </Text>

          <Text allowFontScaling style={styles.subtitle}>
            <Text style={{ color: brandAccentColor }}>• </Text>
            Pet Health Journal
            <Text style={{ color: brandAccentColor }}> •</Text>
          </Text>
        </View>

        <View style={styles.footer}>
          <Text allowFontScaling style={styles.footerLine}>
            Remember every symptom.
          </Text>
          <Text allowFontScaling style={styles.footerLine}>
            Explain <Text style={{ color: brandAccentColor }}>every</Text> vet visit.
          </Text>

          {isLoading ? (
            <ActivityIndicator color={brandAccentColor} size="small" style={styles.spinner} />
          ) : null}

          {phase === 'error' && error ? (
            <View style={[styles.errorContainer, { backgroundColor: surfaceColor }]}>
              <Text allowFontScaling style={styles.errorText}>
                {error}
              </Text>
              <Button title="Try Again" onPress={() => void retry()} />
            </View>
          ) : null}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000000',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'space-between',
  },
  branding: {
    alignItems: 'center',
    paddingTop: '14%',
    gap: Spacing.sm,
  },
  logo: {
    width: 148,
    height: 148,
    marginBottom: Spacing.xs,
  },
  appName: {
    color: Palette.brandAccentLight,
    textAlign: 'center',
    fontSize: Typography.displayLg.fontSize,
    lineHeight: Typography.displayLg.lineHeight,
    fontWeight: Typography.displayLg.fontWeight,
    letterSpacing: Typography.displayLg.letterSpacing,
    fontFamily: Platform.select({
      ios: Fonts?.rounded,
      web: Fonts?.rounded,
      default: undefined,
    }),
  },
  subtitle: {
    color: Palette.onDark,
    textAlign: 'center',
    fontSize: Typography.body.fontSize,
    lineHeight: Typography.body.lineHeight,
    fontWeight: '500',
    letterSpacing: 0.4,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: Spacing.xl,
    gap: Spacing.xxs,
  },
  footerLine: {
    color: Palette.onDark,
    textAlign: 'center',
    fontSize: Typography.body.fontSize,
    lineHeight: Typography.body.lineHeight,
    fontWeight: '400',
  },
  spinner: {
    marginTop: Spacing.lg,
  },
  errorContainer: {
    marginTop: Spacing.lg,
    width: '100%',
    gap: Spacing.md,
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: 16,
  },
  errorText: {
    color: Palette.onDarkSoft,
    textAlign: 'center',
    ...Typography.body,
  },
});
