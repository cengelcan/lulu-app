import { useRouter } from 'expo-router';
import { useCallback } from 'react';

import { WelcomeScreen } from '@/components/welcome/welcome-screen';
import { useTranslation } from '@/hooks/use-translation';

export default function WelcomeRoute() {
  const router = useRouter();
  const { t } = useTranslation();

  const handleStart = useCallback(() => {
    router.replace('/(onboarding)/intro-1');
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
    />
  );
}
