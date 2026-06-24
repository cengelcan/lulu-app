import { useRouter } from 'expo-router';

import { OnboardingScreen } from '@/components/onboarding/onboarding-screen';
import { useTranslation } from '@/hooks/use-translation';

export default function Onboarding3Screen() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <OnboardingScreen
      step={3}
      title={t('onboarding.intro3.title')}
      titleAccent={t('onboarding.intro3.titleAccent')}
      description={t('onboarding.intro3.description')}
      buttonTitle={t('onboarding.intro3.button')}
      onContinue={() => router.push('/(onboarding)/intro-4')}
    />
  );
}
