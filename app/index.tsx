import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { useBootstrap } from '@/hooks/use-bootstrap';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function SplashScreen() {
  const { phase, error, retry } = useBootstrap();
  const primaryColor = useThemeColor({}, 'primary');
  const primaryTextColor = useThemeColor({}, 'primaryText');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const surfaceColor = useThemeColor({}, 'surface');

  const isLoading = phase === 'loading' || phase === 'redirecting';

  return (
    <ScreenContainer contentStyle={styles.content}>
      <View style={styles.center}>
        <View
          accessibilityLabel="Lulu logo"
          accessibilityRole="image"
          style={[styles.logoContainer, { backgroundColor: primaryColor }]}>
          <MaterialIcons name="pets" size={40} color={primaryTextColor} />
        </View>

        <ThemedText type="title" style={styles.appName}>
          Lulu - Pet Health Journal
        </ThemedText>

        <ThemedText
          lightColor={textSecondaryColor}
          darkColor={textSecondaryColor}
          style={styles.tagline}>
          Remember every symptom. Explain every vet visit.
        </ThemedText>

        {isLoading ? (
          <ActivityIndicator color={primaryColor} size="small" style={styles.spinner} />
        ) : null}

        {phase === 'error' && error ? (
          <View style={[styles.errorContainer, { backgroundColor: surfaceColor }]}>
            <ThemedText
              lightColor={textSecondaryColor}
              darkColor={textSecondaryColor}
              style={styles.errorText}>
              {error}
            </ThemedText>
            <Button title="Try Again" onPress={() => void retry()} />
          </View>
        ) : null}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  center: {
    alignItems: 'center',
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
