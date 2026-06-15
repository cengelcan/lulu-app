import { useRouter } from 'expo-router';

import { OnboardingScreen } from '@/components/onboarding/onboarding-screen';
import { useTranslation } from '@/hooks/use-translation';

export default function Onboarding2Screen() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <OnboardingScreen
      step={2}
      title={t('onboarding.intro2.title')}
      description={t('onboarding.intro2.description')}
      buttonTitle={t('onboarding.intro2.button')}
      onContinue={() => router.push('/(onboarding)/intro-3')}
      onBack={() => router.back()}
    />
  );
}
