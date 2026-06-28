import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts, Palette, Radius, Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

const WELCOME_BG = require('@/assets/images/welcome-bg.png');
const LULU_LOGO = require('@/assets/images/lulu-logo.png');
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
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
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

        <View style={styles.scene}>
          <Image
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            source={WELCOME_BG}
            style={styles.sceneImage}
            contentFit="cover"
            contentPosition="bottom"
          />

          <LinearGradient
            colors={['#000000', 'rgba(0,0,0,0.65)', 'transparent']}
            locations={[0, 0.45, 1]}
            style={styles.sceneFade}
            pointerEvents="none"
          />

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
  },
  header: {
    alignItems: 'center',
    paddingTop: '8%',
    gap: Spacing.xs,
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
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
  scene: {
    flex: 1,
    marginTop: Spacing.xl,
    overflow: 'hidden',
  },
  sceneImage: {
    ...StyleSheet.absoluteFillObject,
  },
  sceneFade: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: Spacing.lg,
  },
  startButton: {
    width: '100%',
    minHeight: 52,
    borderRadius: Radius.pill,
  },
});
