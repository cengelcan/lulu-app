import { Image } from 'expo-image';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Fonts, Palette, Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

const SPLASH_BG = require('@/assets/images/splash-screen-bg.png');
const LULU_LOGO = require('@/assets/images/lulu-logo.png');
const LOGO_SIZE = 259;
const SPLASH_BG_HEIGHT_RATIO = 1.24;
const SPLASH_BG_BOTTOM_OFFSET = 92;
const FOOTER_ILLUSTRATION_SLOT_HEIGHT = 104;

type WelcomeScreenProps = {
  appName: string;
  tagline: string;
  footerLine1: string;
  footerLine2Before: string;
  footerLine2Accent: string;
  footerLine2After: string;
  startButtonTitle: string;
  onStart: () => void;
  isLoading?: boolean;
};

export function WelcomeScreen({
  appName,
  tagline,
  footerLine1,
  footerLine2Before,
  footerLine2Accent,
  footerLine2After,
  startButtonTitle,
  onStart,
  isLoading = false,
}: WelcomeScreenProps) {
  const brandAccentColor = useThemeColor({}, 'brandAccent');

  return (
    <View style={styles.root}>
      <View style={styles.background}>
        <Image
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          source={SPLASH_BG}
          style={styles.backgroundImage}
          contentFit="cover"
          contentPosition="bottom"
        />
      </View>

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.branding}>
          <Image
            accessibilityLabel="Lulu"
            source={LULU_LOGO}
            style={styles.logo}
            contentFit="contain"
          />

          <Text allowFontScaling style={styles.appName}>
            {appName}
          </Text>

          <Text allowFontScaling style={styles.subtitle}>
            <Text style={{ color: brandAccentColor }}>• </Text>
            {tagline}
            <Text style={{ color: brandAccentColor }}> •</Text>
          </Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.illustrationSlot} />

          <Text allowFontScaling style={styles.footerLine}>
            {footerLine1}
          </Text>

          <Text allowFontScaling style={styles.footerLine}>
            {footerLine2Before}
            <Text style={{ color: brandAccentColor }}>{footerLine2Accent}</Text>
            {footerLine2After}
          </Text>

          <Button
            title={startButtonTitle}
            accessibilityLabel={startButtonTitle}
            onPress={onStart}
            disabled={isLoading}
            style={styles.startButton}
          />
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
  background: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  backgroundImage: {
    position: 'absolute',
    bottom: SPLASH_BG_BOTTOM_OFFSET,
    width: '100%',
    height: `${SPLASH_BG_HEIGHT_RATIO * 100}%`,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'space-between',
  },
  branding: {
    alignItems: 'center',
    paddingTop: '12%',
    gap: Spacing.md,
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    marginBottom: Spacing.xs,
  },
  appName: {
    color: Palette.brandAccentLight,
    textAlign: 'center',
    fontSize: 46,
    lineHeight: 50,
    fontWeight: Typography.displayLg.fontWeight,
    letterSpacing: -1.3,
    fontFamily: Platform.select({
      ios: Fonts?.rounded,
      web: Fonts?.rounded,
      default: undefined,
    }),
  },
  subtitle: {
    color: Palette.onDark,
    textAlign: 'center',
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '500',
    letterSpacing: 0.4,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: Spacing.xl,
    gap: Spacing.xxs,
  },
  illustrationSlot: {
    width: '100%',
    height: FOOTER_ILLUSTRATION_SLOT_HEIGHT,
  },
  footerLine: {
    color: Palette.onDark,
    textAlign: 'center',
    fontSize: Typography.body.fontSize,
    lineHeight: Typography.body.lineHeight,
    fontWeight: '400',
  },
  startButton: {
    marginTop: Spacing.lg,
    width: '100%',
  },
});
