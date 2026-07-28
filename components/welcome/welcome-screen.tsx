import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme as useSystemColorScheme,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LuluLogo } from '@/components/LuluLogo';
import { Button } from '@/components/ui/Button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Fonts, Palette, Radius, Spacing, Typography } from '@/constants/theme';

const WELCOME_BG_DARK = require('@/assets/images/welcome-bg.png');
const WELCOME_BG_LIGHT = require('@/assets/images/welcome-bg-light-v2.jpg');
const LOGO_SIZE = 180;

const DARK_OVERLAY_COLORS = [
  'rgba(0,0,0,0.78)',
  'rgba(0,0,0,0.35)',
  'rgba(0,0,0,0.2)',
  'rgba(0,0,0,0.72)',
] as const;
const LIGHT_OVERLAY_COLORS = [
  'rgba(248,246,255,0.72)',
  'rgba(248,246,255,0.38)',
  'rgba(255,255,255,0.18)',
  'rgba(239,235,250,0.52)',
] as const;

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
  const colorScheme = useSystemColorScheme() === 'light' ? 'light' : 'dark';
  const isDark = colorScheme === 'dark';
  const theme = Colors[colorScheme];
  const welcomeBackground = isDark ? WELCOME_BG_DARK : WELCOME_BG_LIGHT;
  const overlayColors = isDark ? DARK_OVERLAY_COLORS : LIGHT_OVERLAY_COLORS;

  return (
    <View style={styles.root}>
      <Image
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        source={welcomeBackground}
        style={styles.backgroundImage}
        contentFit="cover"
        contentPosition="bottom center"
      />

      <LinearGradient
        colors={[...overlayColors]}
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
            <LuluLogo
              accessibilityLabel={appName}
              colorSchemeOverride={colorScheme}
              size={LOGO_SIZE}
              style={styles.logo}
            />

            <Text
              allowFontScaling
              style={[
                styles.appName,
                { color: isDark ? Palette.brandAccentLight : theme.accent },
              ]}>
              {appName}
            </Text>

            <Text allowFontScaling style={[styles.subtitle, { color: theme.text }]}>
              {tagline}
            </Text>
          </View>

          <View style={styles.benefits}>
            {benefits.slice(0, 3).map((benefit) => (
              <View
                key={benefit.label}
                style={[
                  styles.benefitRow,
                  {
                    borderColor: isDark ? 'rgba(255,255,255,0.28)' : 'rgba(61,48,102,0.16)',
                    backgroundColor: isDark ? 'rgba(0,0,0,0.42)' : 'rgba(255,255,255,0.68)',
                  },
                ]}>
                <View
                  style={[
                    styles.benefitIcon,
                    {
                      backgroundColor: isDark
                        ? 'rgba(255,255,255,0.12)'
                        : 'rgba(115,98,168,0.11)',
                    },
                  ]}>
                  <IconSymbol name={benefit.icon} size={20} color={theme.brandAccent} />
                </View>
                <Text allowFontScaling style={[styles.benefitLabel, { color: theme.text }]}>
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
                style={[
                  styles.error,
                  {
                    color: theme.alert,
                    backgroundColor: isDark
                      ? 'rgba(0,0,0,0.58)'
                      : 'rgba(255,255,255,0.82)',
                  },
                ]}>
                {error}
              </Text>
            ) : null}
            <Button
              title={startButtonTitle}
              accessibilityLabel={startButtonTitle}
              onPress={onStart}
              disabled={isLoading}
              style={styles.startButton}
              trailingIcon={
                <IconSymbol name="pawprint.fill" size={18} color={theme.primaryText} />
              }
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
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  benefitIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  benefitLabel: {
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
    padding: Spacing.sm,
    borderRadius: Radius.md,
  },
});
