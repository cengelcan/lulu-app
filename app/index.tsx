import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Spacing } from '@/constants/theme';
import { useBootstrap } from '@/hooks/use-bootstrap';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function SplashScreen() {
  const { phase, error, retry } = useBootstrap();
  const primaryColor = useThemeColor({}, 'primary');

  const isLoading = phase === 'loading' || phase === 'redirecting';

  return (
    <ScreenContainer contentStyle={styles.content}>
      <View style={styles.center}>
        <ThemedText type="title" style={styles.title}>
          Pet Health Journal
        </ThemedText>
        <ThemedText style={styles.tagline}>
          Remember every symptom. Explain every vet visit.
        </ThemedText>

        {isLoading ? (
          <ActivityIndicator color={primaryColor} size="large" style={styles.spinner} />
        ) : null}

        {phase === 'error' && error ? (
          <View style={styles.errorContainer}>
            <ThemedText style={styles.errorText}>{error}</ThemedText>
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
    gap: Spacing.sm,
  },
  title: {
    textAlign: 'center',
  },
  tagline: {
    textAlign: 'center',
  },
  spinner: {
    marginTop: Spacing.lg,
  },
  errorContainer: {
    marginTop: Spacing.lg,
    width: '100%',
    gap: Spacing.md,
    alignItems: 'center',
  },
  errorText: {
    textAlign: 'center',
  },
});
