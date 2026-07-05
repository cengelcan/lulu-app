import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { WelcomeScreen } from '@/components/welcome/welcome-screen';
import { useTranslation } from '@/hooks/use-translation';
import { setOnboardingCompleted } from '@/storage/prefs.storage';
import { setUserSetupPath } from '@/storage/setup-path.storage';
import { useOnboardingStore } from '@/stores/onboarding.store';

export default function WelcomeRoute() {
  const router = useRouter();
  const { t } = useTranslation();

  const handleStart = useCallback(() => {
    router.replace('/(onboarding)/intro-1');
  }, [router]);

  const handleJoinFamily = useCallback(async () => {
    await setUserSetupPath('join_family');
    await setOnboardingCompleted(true);
    useOnboardingStore.setState({ hasCompletedOnboarding: true });
    router.replace('/(auth)?mode=signUp');
  }, [router]);

  return (
    <WelcomeScreen
      appName={t('welcome.appName')}
      tagline={t('welcome.tagline')}
      footerLine1={t('welcome.footerLine1')}
      footerLine2Before={t('welcome.footerLine2Before')}
      footerLine2Accent={t('welcome.footerLine2Accent')}
      footerLine2After={t('welcome.footerLine2After')}
      startButtonTitle={t('welcome.startButton')}
      onStart={handleStart}
      footerExtra={
        <Pressable accessibilityRole="button" onPress={() => void handleJoinFamily()}>
          <Text allowFontScaling style={styles.joinLink}>
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
    color: '#ffffff',
    opacity: 0.92,
  },
});
