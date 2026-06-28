import { Image } from 'expo-image';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Palette, Spacing, Typography } from '@/constants/theme';
import { useBootstrap } from '@/hooks/use-bootstrap';
import { useThemeColor } from '@/hooks/use-theme-color';

const LULU_LOGO = require('@/assets/images/lulu-logo.png');
const LOGO_SIZE = 200;

export default function SplashScreen() {
  const { phase, error, retry } = useBootstrap();
  const brandAccentColor = useThemeColor({}, 'brandAccent');
  const surfaceColor = useThemeColor({}, 'surface');

  const isLoading = phase === 'loading' || phase === 'redirecting';

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <Image
            accessibilityLabel="Lulu"
            source={LULU_LOGO}
            style={styles.logo}
            contentFit="contain"
          />

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
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.lg,
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
  },
  spinner: {
    marginTop: Spacing.sm,
  },
  errorContainer: {
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
