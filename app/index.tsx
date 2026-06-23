import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';
import { useBootstrap } from '@/hooks/use-bootstrap';
import { useThemeColor } from '@/hooks/use-theme-color';

const SPLASH_BG = require('@/assets/images/splash-screen-bg.png');

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
        <View style={styles.center}>
          <View
            accessible={false}
            importantForAccessibility="no-hide-descendants"
            style={[styles.logoContainer, { backgroundColor: brandAccentColor }]}>
            <MaterialIcons name="pets" size={40} color={Palette.onDark} />
          </View>

          <ThemedText
            lightColor={Palette.onDark}
            darkColor={Palette.onDark}
            type="title"
            style={styles.appName}>
            Lulu - Pet Health Journal
          </ThemedText>

          <ThemedText
            lightColor={Palette.onDarkSoft}
            darkColor={Palette.onDarkSoft}
            style={styles.tagline}>
            Remember every symptom. Explain every vet visit.
          </ThemedText>

          {isLoading ? (
            <ActivityIndicator color={brandAccentColor} size="small" style={styles.spinner} />
          ) : null}

          {phase === 'error' && error ? (
            <View style={[styles.errorContainer, { backgroundColor: surfaceColor }]}>
              <ThemedText
                lightColor={Palette.onDarkSoft}
                darkColor={Palette.onDarkSoft}
                style={styles.errorText}>
                {error}
              </ThemedText>
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
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: '22%',
    gap: Spacing.md,
  },
  logoContainer: {
    width: 88,
    height: 88,
    borderRadius: Radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  appName: {
    textAlign: 'center',
    ...Typography.title,
  },
  tagline: {
    textAlign: 'center',
    ...Typography.body,
    paddingHorizontal: Spacing.md,
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
    borderRadius: Radius.lg,
  },
  errorText: {
    textAlign: 'center',
    ...Typography.body,
  },
});
