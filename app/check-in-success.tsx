import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Spacing, Typography } from '@/constants/theme';
import { useAndroidBackHandler } from '@/hooks/use-android-back-handler';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/use-translation';
import { useCheckInStore } from '@/stores/check-in.store';

export default function CheckInSuccessScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const checkInCount = useCheckInStore((state) => state.checkIns.length);
  const textSecondaryColor = useThemeColor({}, 'textSecondary');

  const isFirstCheckIn = checkInCount === 1;
  const message = isFirstCheckIn ? t('checkInSuccess.firstMessage') : t('checkInSuccess.message');

  const handleGoHome = useCallback(() => {
    router.dismissTo('/(tabs)/home');
  }, [router]);

  useAndroidBackHandler(
    useCallback(() => {
      handleGoHome();
      return true;
    }, [handleGoHome])
  );

  return (
    <ScreenContainer contentStyle={styles.content}>
      <ThemedText type="title" style={styles.title}>
        {t('checkInSuccess.title')}
      </ThemedText>
      <ThemedText
        lightColor={textSecondaryColor}
        darkColor={textSecondaryColor}
        style={styles.message}>
        {message}
      </ThemedText>
      <Button title={t('checkInSuccess.goHome')} onPress={handleGoHome} style={styles.button} />
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
