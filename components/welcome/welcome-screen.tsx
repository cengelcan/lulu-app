import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LuluLogo } from '@/components/LuluLogo';
import { Button } from '@/components/ui/Button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts, Palette, Radius, Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

const WELCOME_BG = require('@/assets/images/welcome-bg.png');
const LOGO_SIZE = 259;

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
  const buttonTextColor = useThemeColor({}, 'primaryText');

  return (
    <View style={styles.root}>
      <Image
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        source={WELCOME_BG}
        style={styles.backgroundImage}
        contentFit="cover"
        contentPosition="bottom center"
      />

      <LinearGradient
        colors={[
          'rgba(0,0,0,0.78)',
          'rgba(0,0,0,0.35)',
          'rgba(0,0,0,0.2)',
          'rgba(0,0,0,0.72)',
        ]}
        locations={[0, 0.32, 0.62, 1]}
        style={styles.gradientOverlay}
        pointerEvents="none"
      />

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <LuluLogo accessibilityLabel={appName} size={LOGO_SIZE} style={styles.logo} />

          <Text allowFontScaling style={styles.appName}>
            {appName}
          </Text>

          <Text allowFontScaling style={styles.subtitle}>
            <Text style={{ color: brandAccentColor }}>• </Text>
            {tagline}
            <Text style={{ color: brandAccentColor }}> •</Text>
          </Text>

          <View style={styles.taglines}>
            <Text allowFontScaling style={styles.taglineLine}>
              {footerLine1}
            </Text>

            <Text allowFontScaling style={styles.taglineLine}>
              {footerLine2Before}
              <Text style={{ color: brandAccentColor }}>{footerLine2Accent}</Text>
              {footerLine2After}
            </Text>
          </View>
        </View>

        <View style={styles.spacer} />

        <View style={styles.footer}>
          <Button
            title={startButtonTitle}
            accessibilityLabel={startButtonTitle}
            onPress={onStart}
            disabled={isLoading}
            style={styles.startButton}
            trailingIcon={<IconSymbol name="pawprint.fill" size={18} color={buttonTextColor} />}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    overflow: 'hidden',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  header: {
    alignItems: 'center',
    paddingTop: Spacing.md,
    gap: Spacing.xs,
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    backgroundColor: 'transparent',
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
  taglines: {
    alignItems: 'center',
    marginTop: Spacing.xxs,
    gap: Spacing.xxs,
  },
  taglineLine: {
    color: Palette.onDark,
    textAlign: 'center',
    fontSize: Typography.body.fontSize,
    lineHeight: Typography.body.lineHeight,
    fontWeight: '400',
  },
  spacer: {
    flex: 1,
  },
  footer: {
    paddingBottom: Spacing.sm,
  },
  startButton: {
    width: '100%',
    minHeight: 52,
    borderRadius: Radius.pill,
  },
});
