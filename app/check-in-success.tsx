import { useRouter } from 'expo-router';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useCheckInStore } from '@/stores/check-in.store';

export default function CheckInSuccessScreen() {
  const router = useRouter();
  const checkInCount = useCheckInStore((state) => state.checkIns.length);
  const textSecondaryColor = useThemeColor({}, 'textSecondary');

  const isFirstCheckIn = checkInCount === 1;
  const message = isFirstCheckIn
    ? "You've completed your first health check-in."
    : "Your check-in is saved. Thanks for keeping track.";

  return (
    <ScreenContainer contentStyle={styles.content}>
      <ThemedText type="title" style={styles.title}>
        Great!
      </ThemedText>
      <ThemedText
        lightColor={textSecondaryColor}
        darkColor={textSecondaryColor}
        style={styles.message}>
        {message}
      </ThemedText>
      <Button
        title="Go To Dashboard"
        onPress={() => router.replace('/(main)/dashboard')}
        style={styles.button}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
  },
  title: {
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    ...Typography.body,
  },
  button: {
    marginTop: Spacing.lg,
    alignSelf: 'stretch',
  },
});
