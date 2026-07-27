import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LuluLogo } from '@/components/LuluLogo';
import { Button } from '@/components/ui/Button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts, Palette, Radius, Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

const WELCOME_BG = require('@/assets/images/welcome-bg.png');
const LOGO_SIZE = 180;

type WelcomeBenefit = {
  icon: 'checkmark.circle.fill' | 'person.2.fill' | 'calendar.badge.checkmark';
  label: string;
};

type WelcomeScreenProps = {
  appName: string;
  tagline: string;
  benefits: readonly WelcomeBenefit[];
  startButtonTitle: string;
  onStart: () => void;
  isLoading?: boolean;
  error?: string | null;
  footerExtra?: React.ReactNode;
};

export function WelcomeScreen({
  appName,
  tagline,
  benefits,
  startButtonTitle,
  onStart,
  isLoading = false,
  error = null,
  footerExtra,
}: WelcomeScreenProps) {
  const brandAccentColor = useThemeColor({}, 'brandAccent');
  const buttonTextColor = useThemeColor({}, 'primaryText');
  const alertColor = useThemeColor({}, 'alert');

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
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <LuluLogo accessibilityLabel={appName} size={LOGO_SIZE} style={styles.logo} />

            <Text allowFontScaling style={styles.appName}>
              {appName}
            </Text>

            <Text allowFontScaling style={styles.subtitle}>
              {tagline}
            </Text>
          </View>

          <View style={styles.benefits}>
            {benefits.slice(0, 3).map((benefit) => (
              <View key={benefit.label} style={styles.benefitRow}>
                <View style={styles.benefitIcon}>
                  <IconSymbol name={benefit.icon} size={20} color={brandAccentColor} />
                </View>
                <Text allowFontScaling style={styles.benefitLabel}>
                  {benefit.label}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.footer}>
            {error ? (
              <Text
                accessibilityLiveRegion="assertive"
                allowFontScaling
                selectable
                style={[styles.error, { color: alertColor }]}>
                {error}
              </Text>
            ) : null}
            <Button
              title={startButtonTitle}
              accessibilityLabel={startButtonTitle}
              onPress={onStart}
              disabled={isLoading}
              style={styles.startButton}
              trailingIcon={<IconSymbol name="pawprint.fill" size={18} color={buttonTextColor} />}
            />
            {footerExtra ? <View style={styles.footerExtra}>{footerExtra}</View> : null}
          </View>
        </ScrollView>
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
    ...StyleSheet.absoluteFill,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
    gap: Spacing.lg,
  },
  header: {
    alignItems: 'center',
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
    fontSize: 40,
    lineHeight: 44,
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
    ...Typography.body,
    fontWeight: '500',
    maxWidth: 420,
  },
  benefits: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    gap: Spacing.sm,
  },
  benefitRow: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: Radius.lg,
    borderCurve: 'continuous',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.28)',
    backgroundColor: 'rgba(0,0,0,0.42)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  benefitIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    flexShrink: 0,
  },
  benefitLabel: {
    color: Palette.onDark,
    flex: 1,
    ...Typography.bodySemiBold,
  },
  footer: {
    gap: Spacing.md,
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
  },
  footerExtra: {
    alignItems: 'center',
  },
  startButton: {
    width: '100%',
    minHeight: 52,
    borderRadius: Radius.pill,
  },
  error: {
    ...Typography.caption,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.58)',
    padding: Spacing.sm,
    borderRadius: Radius.md,
  },
});
