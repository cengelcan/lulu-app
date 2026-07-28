import { type Href, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { Pressable, StyleSheet, Text, useColorScheme as useSystemColorScheme } from 'react-native';

import { WelcomeScreen } from '@/components/welcome/welcome-screen';
import { Colors } from '@/constants/theme';
import { useTranslation } from '@/hooks/use-translation';
import { setUserSetupPath } from '@/storage/setup-path.storage';
import { useOnboardingStore } from '@/stores/onboarding.store';
import { translateError } from '@/utils/translate-error';

export default function WelcomeRoute() {
  const router = useRouter();
  const { t } = useTranslation();
  const systemColorScheme = useSystemColorScheme() === 'light' ? 'light' : 'dark';
  const linkColor = Colors[systemColorScheme].text;
  const completeOnboarding = useOnboardingStore((state) => state.completeOnboarding);
  const clearError = useOnboardingStore((state) => state.clearError);
  const isLoading = useOnboardingStore((state) => state.isLoading);
  const error = useOnboardingStore((state) => state.error);

  const handleStart = useCallback(async () => {
    clearError();
    await completeOnboarding();
    if (useOnboardingStore.getState().error) return;
    router.replace('/(auth)?mode=signUp' as Href);
  }, [clearError, completeOnboarding, router]);

  const handleJoinFamily = useCallback(async () => {
    clearError();
    await setUserSetupPath('join_family');
    await completeOnboarding();
    if (useOnboardingStore.getState().error) return;
    router.replace('/(auth)?mode=signUp');
  }, [clearError, completeOnboarding, router]);

  return (
    <WelcomeScreen
      appName={t('welcome.appName')}
      tagline={t('welcome.tagline')}
      benefits={[
        { icon: 'checkmark.circle.fill', label: t('welcome.benefitDailyCare') },
        { icon: 'person.2.fill', label: t('welcome.benefitFamily') },
        { icon: 'calendar.badge.checkmark', label: t('welcome.benefitVet') },
      ]}
      startButtonTitle={t('welcome.startButton')}
      onStart={handleStart}
      isLoading={isLoading}
      error={translateError(t, error)}
      footerExtra={
        <Pressable accessibilityRole="button" onPress={() => void handleJoinFamily()}>
          <Text allowFontScaling style={[styles.joinLink, { color: linkColor }]}>
            {t('welcome.joinFamilyButton')}
          </Text>
        </Pressable>
      }
    />
  );
}

const styles = StyleSheet.create({
  joinLink: {
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
    opacity: 0.92,
  },
});
